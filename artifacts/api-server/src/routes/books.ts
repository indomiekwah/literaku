import { Router, type Request, type Response } from "express";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import multer from "multer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { randomUUID } from "crypto";

const booksRouter = Router();
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

const ADMIN_API_KEY = process.env["ADMIN_API_KEY"] || "literaku-admin-2026";

function requireAdmin(req: Request, res: Response): boolean {
  const authHeader = req.headers["authorization"];
  const apiKey = req.headers["x-api-key"] as string | undefined;
  const key = apiKey || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined);
  if (!key || key !== ADMIN_API_KEY) {
    res.status(401).json({ error: "Unauthorized. Admin API key required." });
    return false;
  }
  return true;
}

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

booksRouter.post(
  "/books/upload",
  upload.single("pdf"),
  async (req: Request, res: Response) => {
    try {
      if (!requireAdmin(req, res)) return;

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

booksRouter.get("/books", async (_req: Request, res: Response) => {
  try {
    const metaContainer = await getContainer(METADATA_CONTAINER);
    const books: BookMetadata[] = [];

    for await (const blob of metaContainer.listBlobsFlat()) {
      if (blob.name.endsWith(".json")) {
        const content = (await downloadBlobToBuffer(metaContainer, blob.name)).toString("utf-8");
        books.push(JSON.parse(content));
      }
    }

    books.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    res.json({ books });
  } catch (error: any) {
    console.error("List books error:", error);
    res.status(500).json({ error: error.message || "Failed to list books" });
  }
});

booksRouter.get("/books/:bookId", async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const metaContainer = await getContainer(METADATA_CONTAINER);
    const metaBlob = metaContainer.getBlockBlobClient(`${bookId}.json`);

    const exists = await metaBlob.exists();
    if (!exists) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    const content = (await downloadBlobToBuffer(metaContainer, `${bookId}.json`)).toString("utf-8");
    const metadata: BookMetadata = JSON.parse(content);

    res.json({ book: metadata });
  } catch (error: any) {
    console.error("Get book error:", error);
    res.status(500).json({ error: error.message || "Failed to get book" });
  }
});

booksRouter.get("/books/:bookId/pages", async (req: Request, res: Response) => {
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

booksRouter.delete("/books/:bookId", async (req: Request, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { bookId } = req.params;

    const metaContainer = await getContainer(METADATA_CONTAINER);
    const metaBlob = metaContainer.getBlockBlobClient(`${bookId}.json`);
    const metaExists = await metaBlob.exists();
    if (!metaExists) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    const booksContainer = await getContainer(BOOKS_CONTAINER);
    const pdfBlob = booksContainer.getBlockBlobClient(`${bookId}.pdf`);

    await Promise.all([metaBlob.deleteIfExists(), pdfBlob.deleteIfExists()]);

    res.json({ success: true, message: `Book "${bookId}" deleted` });
  } catch (error: any) {
    console.error("Delete book error:", error);
    res.status(500).json({ error: error.message || "Failed to delete book" });
  }
});

export default booksRouter;
