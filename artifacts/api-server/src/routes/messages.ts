import { Router } from "express";
import { db, messagesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/* GET /api/messages/:projectId */
router.get("/:projectId", requireAuth, async (req, res) => {
  try {
    const projectId = parseInt(req.params["projectId"]!);

    const messages = await db
      .select({
        id: messagesTable.id,
        content: messagesTable.content,
        projectId: messagesTable.projectId,
        userId: messagesTable.userId,
        username: usersTable.username,
        displayName: usersTable.displayName,
        createdAt: messagesTable.createdAt,
      })
      .from(messagesTable)
      .leftJoin(usersTable, eq(messagesTable.userId, usersTable.id))
      .where(eq(messagesTable.projectId, projectId))
      .orderBy(messagesTable.createdAt)
      .limit(100);

    res.json(messages);
  } catch (err) {
    console.error("List messages error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* POST /api/messages/:projectId */
router.post("/:projectId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const projectId = parseInt(req.params["projectId"]!);
    const userId = req.user!.userId;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: "Bad Request", message: "content is required" });
      return;
    }

    const [message] = await db.insert(messagesTable).values({
      content,
      projectId,
      userId,
    }).returning();

    const [user] = await db.select({ username: usersTable.username, displayName: usersTable.displayName })
      .from(usersTable).where(eq(usersTable.id, userId));

    res.status(201).json({
      ...message,
      username: user?.username,
      displayName: user?.displayName,
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
