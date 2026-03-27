import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "../middleware/auth";

const router = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    if (user.role === "student") {
      res.status(400).json({ error: "Students should use OAuth login" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const { verifyToken } = await import("../middleware/auth");
    const payload = verifyToken(authHeader.substring(7));

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      institutionId: user.institutionId,
    });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

async function verifyGoogleIdToken(idToken: string): Promise<{ email: string; name?: string; sub: string } | null> {
  try {
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!resp.ok) return null;
    const data = await resp.json() as Record<string, string>;
    if (!data.email || data.email_verified !== "true") return null;
    if (data.iss !== "accounts.google.com" && data.iss !== "https://accounts.google.com") return null;
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && data.aud !== expectedClientId) return null;
    return { email: data.email, name: data.name, sub: data.sub };
  } catch {
    return null;
  }
}

async function verifyMicrosoftIdToken(accessToken: string): Promise<{ email: string; name?: string; sub: string } | null> {
  try {
    const resp = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!resp.ok) return null;
    const data = await resp.json() as Record<string, string>;
    const email = data.mail || data.userPrincipalName;
    if (!email) return null;
    return { email, name: data.displayName, sub: data.id };
  } catch {
    return null;
  }
}

router.post("/auth/student-token", async (req, res) => {
  try {
    const { idToken, provider } = req.body;
    if (!idToken || !provider) {
      res.status(400).json({ error: "idToken and provider (google or microsoft) are required" });
      return;
    }

    if (!["google", "microsoft"].includes(provider)) {
      res.status(400).json({ error: "Provider must be 'google' or 'microsoft'" });
      return;
    }

    let verified: { email: string; name?: string; sub: string } | null = null;

    if (provider === "google") {
      verified = await verifyGoogleIdToken(idToken);
    } else {
      verified = await verifyMicrosoftIdToken(idToken);
    }

    if (!verified) {
      res.status(401).json({ error: "Invalid or expired OAuth token" });
      return;
    }

    let user = await db.query.users.findFirst({
      where: eq(users.email, verified.email),
    });

    if (user && user.role !== "student") {
      res.status(403).json({ error: "This email is registered with a non-student role" });
      return;
    }

    if (!user) {
      const [created] = await db
        .insert(users)
        .values({
          email: verified.email,
          name: verified.name || verified.email.split("@")[0],
          role: "student",
          externalId: verified.sub,
        })
        .returning();
      user = created;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
      },
    });
  } catch (err) {
    console.error("Student token exchange error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
