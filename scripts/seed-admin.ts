import bcrypt from "bcrypt";
import { db, pool } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  const email = process.env.ADMIN_EMAIL || "admin@literaku.id";
  const password = process.env.ADMIN_PASSWORD || "LiterakuAdmin2024!";
  const name = process.env.ADMIN_NAME || "Super Admin";

  if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === "production") {
    console.error("ERROR: ADMIN_PASSWORD must be set in production. Do not use default credentials.");
    process.exit(1);
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [admin] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash,
      role: "super_admin",
    })
    .returning();

  console.log(`Created super admin: ${admin.email} (id: ${admin.id})`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log("Using default password. Set ADMIN_PASSWORD env var for custom credentials.");
  }
  console.log("IMPORTANT: Change this password after first login!");

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
