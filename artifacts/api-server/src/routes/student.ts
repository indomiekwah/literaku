import { Router } from "express";
import { db } from "@workspace/db";
import { bookAssignments } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/student/books", authMiddleware, requireRole("student"), async (req, res) => {
  try {
    const userId = req.user!.userId;

    const assignments = await db.query.bookAssignments.findMany({
      where: and(
        eq(bookAssignments.studentId, userId),
        eq(bookAssignments.isActive, true),
      ),
      with: {
        book: true,
        institution: {
          columns: { id: true, name: true },
        },
      },
      orderBy: (ba, { desc }) => [desc(ba.assignedAt)],
    });

    res.json(assignments);
  } catch (err) {
    console.error("Get student books error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
