import { Router, type Request, type Response } from "express";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import multer from "multer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import {
  bookCatalog,
  digitizationRequests,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

function getConnectionString(): string {
  const raw = process.env["AZURE_STORAGE_CONNECTION_STRING"] || "";
  if (raw.startsWith("DefaultEndpointsProtocol=")) {
    return raw;
  }
  if (raw.length > 0) {
    return `DefaultEndpointsProtocol=https;AccountName=literakustorage;AccountKey=${raw};EndpointSuffix=core.windows.net`;
  }
  return "";
}

const BOOKS_CONTAINER = "books";
const METADATA_CONTAINER = "metadata";

let blobServiceClient: BlobServiceClient | null = null;
const containerCache = new Map<string, ContainerClient>();

function getBlobServiceClient(): BlobServiceClient {
  if (blobServiceClient) return blobServiceClient;
  const connStr = getConnectionString();
  if (!connStr) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not configured");
  }
  blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
  return blobServiceClient;
}

async function getContainer(name: string): Promise<ContainerClient> {
  const cached = containerCache.get(name);
  if (cached) return cached;
  const client = getBlobServiceClient();
  const container = client.getContainerClient(name);
  await container.createIfNotExists();
  containerCache.set(name, container);
  return container;
}

async function extractSinglePage(pdfBuffer: Buffer, pageNum: number): Promise<{ text: string; totalPages: number }> {
  const data = new Uint8Array(pdfBuffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const totalPages = doc.numPages;

  if (pageNum < 1 || pageNum > totalPages) {
    doc.destroy();
    throw new RangeError(`Page ${pageNum} out of range (1-${totalPages})`);
  }

  const page = await doc.getPage(pageNum);
  const content = await page.getTextContent();
  const text = (content.items as any[])
    .map((item) => item.str)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  doc.destroy();
  return { text, totalPages };
}

async function extractAllPages(pdfBuffer: Buffer): Promise<{ pages: string[]; totalPages: number }> {
  const data = new Uint8Array(pdfBuffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const totalPages = doc.numPages;
  const pages: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = (content.items as any[])
      .map((item) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(text);
  }

  doc.destroy();
  return { pages, totalPages };
}

async function getPdfPageCount(pdfBuffer: Buffer): Promise<number> {
  const data = new Uint8Array(pdfBuffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const count = doc.numPages;
  doc.destroy();
  return count;
}

async function downloadBlobToBuffer(container: ContainerClient, blobName: string): Promise<Buffer> {
  const blobClient = container.getBlockBlobClient(blobName);
  const download = await blobClient.download(0);
  const chunks: Buffer[] = [];
  for await (const chunk of download.readableStreamBody as NodeJS.ReadableStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function parseGenres(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((g) => typeof g === "string")) {
      return parsed;
    }
    return [];
  } catch {
    return raw.split(",").map((g) => g.trim()).filter(Boolean);
  }
}

interface BookMetadata {
  id: string;
  title: string;
  author: string;
  genres: string[];
  category: string;
  synopsis: string;
  coverColor: string;
  language: string;
  totalPages: number;
  uploadedAt: string;
  pdfBlobName: string;
}

router.post(
  "/books/upload",
  authMiddleware,
  requireRole("super_admin"),
  upload.single("pdf"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No PDF file provided" });
        return;
      }

      const { title, author, genres, category, synopsis, coverColor, language } = req.body;

      if (!title || !author) {
        res.status(400).json({ error: "title and author are required" });
        return;
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const id = `${slug}-${randomUUID().slice(0, 8)}`;

      const pdfBuffer = req.file.buffer;
      const totalPages = await getPdfPageCount(pdfBuffer);

      const booksContainer = await getContainer(BOOKS_CONTAINER);
      const pdfBlobName = `${id}.pdf`;
      const pdfBlob = booksContainer.getBlockBlobClient(pdfBlobName);
      await pdfBlob.uploadData(pdfBuffer, {
        blobHTTPHeaders: { blobContentType: "application/pdf" },
      });

      const metadata: BookMetadata = {
        id,
        title,
        author,
        genres: parseGenres(genres),
        category: category || "General",
        synopsis: synopsis || "",
        coverColor: coverColor || "#1976D2",
        language: language || "id-ID",
        totalPages,
        uploadedAt: new Date().toISOString(),
        pdfBlobName,
      };

      const metaContainer = await getContainer(METADATA_CONTAINER);
      const metaBlob = metaContainer.getBlockBlobClient(`${id}.json`);
      await metaBlob.uploadData(Buffer.from(JSON.stringify(metadata, null, 2)), {
        blobHTTPHeaders: { blobContentType: "application/json" },
      });

      res.json({
        success: true,
        book: metadata,
        message: `Book "${title}" uploaded successfully (${totalPages} pages)`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  }
);

router.get("/books/:bookId/pages", async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const pageParam = req.query["page"] as string | undefined;

    const metaContainer = await getContainer(METADATA_CONTAINER);
    const metaBlob = metaContainer.getBlockBlobClient(`${bookId}.json`);
    const metaExists = await metaBlob.exists();
    if (!metaExists) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    const booksContainer = await getContainer(BOOKS_CONTAINER);
    const pdfBlob = booksContainer.getBlockBlobClient(`${bookId}.pdf`);
    const pdfExists = await pdfBlob.exists();
    if (!pdfExists) {
      res.status(404).json({ error: "PDF file not found" });
      return;
    }

    const pdfBuffer = await downloadBlobToBuffer(booksContainer, `${bookId}.pdf`);

    if (pageParam !== undefined) {
      const pageNum = parseInt(pageParam, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        res.status(400).json({ error: "Invalid page number" });
        return;
      }
      try {
        const { text, totalPages } = await extractSinglePage(pdfBuffer, pageNum);
        res.json({ bookId, page: pageNum, totalPages, content: text });
      } catch (err: any) {
        if (err instanceof RangeError) {
          res.status(400).json({ error: err.message });
        } else {
          throw err;
        }
      }
    } else {
      const { pages, totalPages } = await extractAllPages(pdfBuffer);
      res.json({ bookId, totalPages, pages });
    }
  } catch (error: any) {
    console.error("Get pages error:", error);
    res.status(500).json({ error: error.message || "Failed to extract pages" });
  }
});

router.get("/books", authMiddleware, async (_req, res) => {
  try {
    const result = await db.query.bookCatalog.findMany({
      where: eq(bookCatalog.isActive, true),
      orderBy: (b, { desc }) => [desc(b.createdAt)],
    });
    res.json(result);
  } catch (err) {
    console.error("List books error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/books/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const book = await db.query.bookCatalog.findFirst({
      where: eq(bookCatalog.id, id),
    });
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    res.json(book);
  } catch (err) {
    console.error("Get book error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/books",
  authMiddleware,
  requireRole("super_admin", "operator"),
  async (req, res) => {
    try {
      const { title, author, isbn, language, level, coverImageUrl, description } =
        req.body;
      if (!title) {
        res.status(400).json({ error: "Book title is required" });
        return;
      }

      const [book] = await db
        .insert(bookCatalog)
        .values({
          title,
          author,
          isbn,
          language: language || "id",
          level,
          coverImageUrl,
          description,
        })
        .returning();

      res.status(201).json(book);
    } catch (err) {
      console.error("Create book error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.put(
  "/books/:id",
  authMiddleware,
  requireRole("super_admin", "operator"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const { title, author, isbn, language, level, coverImageUrl, description, isActive } =
        req.body;

      const [updated] = await db
        .update(bookCatalog)
        .set({
          ...(title !== undefined && { title }),
          ...(author !== undefined && { author }),
          ...(isbn !== undefined && { isbn }),
          ...(language !== undefined && { language }),
          ...(level !== undefined && { level }),
          ...(coverImageUrl !== undefined && { coverImageUrl }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        })
        .where(eq(bookCatalog.id, id))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Book not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      console.error("Update book error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/books/:id",
  authMiddleware,
  requireRole("super_admin"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const [deleted] = await db
        .delete(bookCatalog)
        .where(eq(bookCatalog.id, id))
        .returning();

      if (!deleted) {
        res.status(404).json({ error: "Book not found" });
        return;
      }
      res.json({ message: "Book deleted" });
    } catch (err) {
      console.error("Delete book error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post(
  "/digitization-requests",
  authMiddleware,
  requireRole("operator"),
  async (req, res) => {
    try {
      const institutionId = req.user!.institutionId;
      if (!institutionId) {
        res.status(400).json({ error: "Operator is not assigned to an institution" });
        return;
      }

      const { bookTitle, bookAuthor, bookIsbn, notes } = req.body;
      if (!bookTitle) {
        res.status(400).json({ error: "Book title is required" });
        return;
      }

      const [request] = await db
        .insert(digitizationRequests)
        .values({
          institutionId,
          requestedBy: req.user!.userId,
          bookTitle,
          bookAuthor,
          bookIsbn,
          notes,
        })
        .returning();

      res.status(201).json(request);
    } catch (err) {
      console.error("Create digitization request error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/digitization-requests", authMiddleware, async (req, res) => {
  try {
    const user = req.user!;

    let whereClause;
    if (user.role === "super_admin") {
      whereClause = undefined;
    } else if (user.role === "operator" && user.institutionId) {
      whereClause = eq(digitizationRequests.institutionId, user.institutionId);
    } else {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    const result = await db.query.digitizationRequests.findMany({
      where: whereClause,
      with: {
        institution: { columns: { id: true, name: true } },
        requester: { columns: { id: true, name: true, email: true } },
      },
      orderBy: (dr, { desc }) => [desc(dr.createdAt)],
    });
    res.json(result);
  } catch (err) {
    console.error("List digitization requests error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put(
  "/digitization-requests/:id",
  authMiddleware,
  requireRole("super_admin"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const { status, adminNotes } = req.body;

      const [updated] = await db
        .update(digitizationRequests)
        .set({
          ...(status !== undefined && { status }),
          ...(adminNotes !== undefined && { adminNotes }),
          updatedAt: new Date(),
        })
        .where(eq(digitizationRequests.id, id))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Digitization request not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      console.error("Update digitization request error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
