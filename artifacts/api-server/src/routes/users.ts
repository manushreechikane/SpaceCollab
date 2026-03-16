import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/* GET /api/users - Admin: list all users */
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const users = await db.select({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      displayName: usersTable.displayName,
      grade: usersTable.grade,
      role: usersTable.role,
      bio: usersTable.bio,
      avatarUrl: usersTable.avatarUrl,
      createdAt: usersTable.createdAt,
    }).from(usersTable);

    res.json(users);
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* GET /api/users/:id */
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const [user] = await db.select({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      displayName: usersTable.displayName,
      grade: usersTable.grade,
      role: usersTable.role,
      bio: usersTable.bio,
      avatarUrl: usersTable.avatarUrl,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, id)).limit(1);

    if (!user) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* DELETE /api/users/:id - Admin: delete user */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
