import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/* POST /api/auth/register */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, displayName, grade } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: "Bad Request", message: "username, email and password are required" });
      return;
    }

    // Check if user already exists
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Bad Request", message: "Email already registered" });
      return;
    }

    const existingUsername = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existingUsername.length > 0) {
      res.status(400).json({ error: "Bad Request", message: "Username already taken" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db.insert(usersTable).values({
      username,
      email,
      passwordHash,
      displayName: displayName || username,
      grade: grade || null,
      role: "student",
    }).returning();

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        grade: user.grade,
        role: user.role,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Registration failed" });
  }
});

/* POST /api/auth/login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Bad Request", message: "email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        grade: user.grade,
        role: user.role,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Login failed" });
  }
});

/* GET /api/auth/me */
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      grade: user.grade,
      role: user.role,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
