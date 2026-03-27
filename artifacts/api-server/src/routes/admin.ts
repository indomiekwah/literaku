import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import {
  institutions,
  users,
  bookAssignments,
  readingProgress,
} from "@workspace/db/schema";
import { eq, count, sql, and, desc } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.use("/admin", authMiddleware, requireRole("super_admin"));

router.get("/admin/stats", async (_req, res) => {
  try {
    const [instCount] = await db
      .select({ value: count() })
      .from(institutions);
    const [studentCount] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "student"));
    const [operatorCount] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "operator"));
    const [activeReaders] = await db
      .select({ value: sql<number>`count(distinct ${readingProgress.studentId})` })
      .from(readingProgress);

    res.json({
      totalInstitutions: instCount.value,
      totalStudents: studentCount.value,
      totalOperators: operatorCount.value,
      activeReaders: Number(activeReaders.value),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/institutions", async (_req, res) => {
  try {
    const result = await db.query.institutions.findMany({
      orderBy: (inst, { desc }) => [desc(inst.createdAt)],
    });
    res.json(result);
  } catch (err) {
    console.error("List institutions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/institutions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const institution = await db.query.institutions.findFirst({
      where: eq(institutions.id, id),
    });
    if (!institution) {
      res.status(404).json({ error: "Institution not found" });
      return;
    }
    res.json(institution);
  } catch (err) {
    console.error("Get institution error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/institutions", async (req, res) => {
  try {
    const { name, address, contactEmail, contactPhone } = req.body;
    if (!name) {
      res.status(400).json({ error: "Institution name is required" });
      return;
    }

    const [institution] = await db
      .insert(institutions)
      .values({ name, address, contactEmail, contactPhone })
      .returning();

    res.status(201).json(institution);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "Institution with this name already exists" });
      return;
    }
    console.error("Create institution error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/institutions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, address, contactEmail, contactPhone, isActive } = req.body;

    const [updated] = await db
      .update(institutions)
      .set({
        ...(name !== undefined && { name }),
        ...(address !== undefined && { address }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(institutions.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Institution not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("Update institution error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/institutions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [deleted] = await db
      .delete(institutions)
      .where(eq(institutions.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Institution not found" });
      return;
    }
    res.json({ message: "Institution deleted" });
  } catch (err) {
    console.error("Delete institution error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/operators", async (req, res) => {
  try {
    const { email, name, password, institutionId } = req.body;
    if (!email || !name || !password || !institutionId) {
      res.status(400).json({
        error: "Email, name, password, and institutionId are required",
      });
      return;
    }

    const institution = await db.query.institutions.findFirst({
      where: eq(institutions.id, institutionId),
    });
    if (!institution) {
      res.status(404).json({ error: "Institution not found" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [operator] = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        role: "operator",
        institutionId,
      })
      .returning();

    res.status(201).json({
      id: operator.id,
      email: operator.email,
      name: operator.name,
      role: operator.role,
      institutionId: operator.institutionId,
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A user with this email already exists" });
      return;
    }
    console.error("Create operator error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/operators", async (_req, res) => {
  try {
    const result = await db.query.users.findMany({
      where: eq(users.role, "operator"),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        institutionId: true,
        isActive: true,
        createdAt: true,
      },
      with: {
        institution: true,
      },
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });
    res.json(result);
  } catch (err) {
    console.error("List operators error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/activity", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

    const recentAssignments = await db.query.bookAssignments.findMany({
      with: {
        book: { columns: { id: true, title: true } },
        student: { columns: { id: true, name: true, email: true } },
        institution: { columns: { id: true, name: true } },
      },
      orderBy: (ba, { desc: d }) => [d(ba.assignedAt)],
      limit,
    });

    const recentProgress = await db.query.readingProgress.findMany({
      with: {
        student: { columns: { id: true, name: true, email: true } },
        book: { columns: { id: true, title: true } },
      },
      orderBy: (rp, { desc: d }) => [d(rp.updatedAt)],
      limit,
    });

    const recentUsers = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        institutionId: true,
        createdAt: true,
      },
      orderBy: (u, { desc: d }) => [d(u.createdAt)],
      limit,
    });

    res.json({
      recentAssignments,
      recentProgress,
      recentUsers,
    });
  } catch (err) {
    console.error("Admin activity error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
