import { Router } from "express";
import { db } from "@workspace/db";
import {
  users,
  bookAssignments,
  readingProgress,
  bookCatalog,
} from "@workspace/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middleware/auth";
import { parse } from "csv-parse/sync";

const router = Router();

router.use("/operator", authMiddleware, requireRole("operator"));

router.post("/operator/students", async (req, res) => {
  try {
    const institutionId = req.user!.institutionId;
    if (!institutionId) {
      res.status(400).json({ error: "Operator is not assigned to an institution" });
      return;
    }

    const { email, name, externalId } = req.body;
    if (!email || !name) {
      res.status(400).json({ error: "Email and name are required" });
      return;
    }

    const [student] = await db
      .insert(users)
      .values({
        email,
        name,
        role: "student",
        institutionId,
        externalId: externalId || null,
      })
      .returning();

    res.status(201).json({
      id: student.id,
      email: student.email,
      name: student.name,
      role: student.role,
      institutionId: student.institutionId,
      externalId: student.externalId,
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A user with this email already exists" });
      return;
    }
    console.error("Register student error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/operator/students/bulk", async (req, res) => {
  try {
    const institutionId = req.user!.institutionId;
    if (!institutionId) {
      res.status(400).json({ error: "Operator is not assigned to an institution" });
      return;
    }

    const { csv } = req.body;
    if (!csv) {
      res.status(400).json({ error: "CSV data is required" });
      return;
    }

    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<{ email: string; name: string; external_id?: string }>;

    if (records.length === 0) {
      res.status(400).json({ error: "No valid records found in CSV" });
      return;
    }

    const results: { created: number; errors: string[] } = {
      created: 0,
      errors: [],
    };

    for (const record of records) {
      if (!record.email || !record.name) {
        results.errors.push(`Missing email or name for row: ${JSON.stringify(record)}`);
        continue;
      }
      try {
        await db.insert(users).values({
          email: record.email,
          name: record.name,
          role: "student",
          institutionId,
          externalId: record.external_id || null,
        });
        results.created++;
      } catch (err: any) {
        if (err?.code === "23505") {
          results.errors.push(`Duplicate email: ${record.email}`);
        } else {
          results.errors.push(`Error creating ${record.email}: ${err.message}`);
        }
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Bulk register students error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/operator/students", async (req, res) => {
  try {
    const institutionId = req.user!.institutionId;
    if (!institutionId) {
      res.status(400).json({ error: "Operator is not assigned to an institution" });
      return;
    }

    const result = await db.query.users.findMany({
      where: and(eq(users.role, "student"), eq(users.institutionId, institutionId)),
      columns: {
        id: true,
        email: true,
        name: true,
        externalId: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });
    res.json(result);
  } catch (err) {
    console.error("List students error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/operator/assignments", async (req, res) => {
  try {
    const institutionId = req.user!.institutionId;
    if (!institutionId) {
      res.status(400).json({ error: "Operator is not assigned to an institution" });
      return;
    }

    const { bookId, studentId, dueDate } = req.body;
    if (!bookId || !studentId) {
      res.status(400).json({ error: "bookId and studentId are required" });
      return;
    }

    const book = await db.query.bookCatalog.findFirst({
      where: and(eq(bookCatalog.id, bookId), eq(bookCatalog.isActive, true)),
    });
    if (!book) {
      res.status(404).json({ error: "Book not found or inactive" });
      return;
    }

    const student = await db.query.users.findFirst({
      where: and(
        eq(users.id, studentId),
        eq(users.institutionId, institutionId),
        eq(users.role, "student"),
      ),
    });
    if (!student) {
      res.status(404).json({ error: "Student not found in your institution" });
      return;
    }

    const [assignment] = await db
      .insert(bookAssignments)
      .values({
        bookId,
        studentId,
        institutionId,
        assignedBy: req.user!.userId,
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning();

    res.status(201).json(assignment);
  } catch (err) {
    console.error("Create assignment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/operator/assignments/bulk", async (req, res) => {
  try {
    const institutionId = req.user!.institutionId;
    if (!institutionId) {
      res.status(400).json({ error: "Operator is not assigned to an institution" });
      return;
    }

    const { bookId, studentIds, dueDate } = req.body;
    if (!bookId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ error: "bookId and studentIds array are required" });
      return;
    }

    const book = await db.query.bookCatalog.findFirst({
      where: and(eq(bookCatalog.id, bookId), eq(bookCatalog.isActive, true)),
    });
    if (!book) {
      res.status(404).json({ error: "Book not found or inactive" });
      return;
    }

    const validStudents = await db.query.users.findMany({
      where: and(
        inArray(users.id, studentIds),
        eq(users.institutionId, institutionId),
        eq(users.role, "student"),
      ),
    });

    const validIds = new Set(validStudents.map((s) => s.id));
    const assignments = [];

    for (const sid of studentIds) {
      if (validIds.has(sid)) {
        assignments.push({
          bookId,
          studentId: sid,
          institutionId,
          assignedBy: req.user!.userId,
          dueDate: dueDate ? new Date(dueDate) : null,
        });
      }
    }

    if (assignments.length === 0) {
      res.status(400).json({ error: "No valid students found in your institution" });
      return;
    }

    const created = await db.insert(bookAssignments).values(assignments).returning();

    res.status(201).json({
      created: created.length,
      skipped: studentIds.length - created.length,
    });
  } catch (err) {
    console.error("Bulk assignment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/operator/assignments/:id", async (req, res) => {
  try {
    const institutionId = req.user!.institutionId;
    const id = parseInt(req.params.id as string);

    const [deleted] = await db
      .update(bookAssignments)
      .set({ isActive: false })
      .where(
        and(
          eq(bookAssignments.id, id),
          eq(bookAssignments.institutionId, institutionId!),
        ),
      )
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    res.json({ message: "Assignment deactivated" });
  } catch (err) {
    console.error("Unassign error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/operator/assignments/bulk-unassign", async (req, res) => {
  try {
    const institutionId = req.user!.institutionId;
    if (!institutionId) {
      res.status(400).json({ error: "Operator is not assigned to an institution" });
      return;
    }

    const { assignmentIds } = req.body;
    if (!assignmentIds || !Array.isArray(assignmentIds) || assignmentIds.length === 0) {
      res.status(400).json({ error: "assignmentIds array is required" });
      return;
    }

    const updated = await db
      .update(bookAssignments)
      .set({ isActive: false })
      .where(
        and(
          inArray(bookAssignments.id, assignmentIds),
          eq(bookAssignments.institutionId, institutionId),
        ),
      )
      .returning();

    res.json({
      deactivated: updated.length,
      requested: assignmentIds.length,
    });
  } catch (err) {
    console.error("Bulk unassign error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/operator/progress", async (req, res) => {
  try {
    const institutionId = req.user!.institutionId;
    if (!institutionId) {
      res.status(400).json({ error: "Operator is not assigned to an institution" });
      return;
    }

    const studentId = req.query.studentId
      ? parseInt(req.query.studentId as string)
      : undefined;

    let whereClause;
    if (studentId) {
      const student = await db.query.users.findFirst({
        where: and(
          eq(users.id, studentId),
          eq(users.institutionId, institutionId),
        ),
      });
      if (!student) {
        res.status(404).json({ error: "Student not found in your institution" });
        return;
      }
      whereClause = eq(readingProgress.studentId, studentId);
    } else {
      const instStudents = await db.query.users.findMany({
        where: and(eq(users.role, "student"), eq(users.institutionId, institutionId)),
        columns: { id: true },
      });
      const studentIds = instStudents.map((s) => s.id);
      if (studentIds.length === 0) {
        res.json([]);
        return;
      }
      whereClause = inArray(readingProgress.studentId, studentIds);
    }

    const result = await db.query.readingProgress.findMany({
      where: whereClause,
      with: {
        student: {
          columns: { id: true, name: true, email: true },
        },
        book: {
          columns: { id: true, title: true, author: true },
        },
      },
      orderBy: (rp, { desc }) => [desc(rp.updatedAt)],
    });

    res.json(result);
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
