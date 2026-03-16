import { Router } from "express";
import { db, projectsTable, projectMembersTable, projectCommentsTable, projectExperimentsTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/* GET /api/projects */
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const projects = await db
      .select({
        id: projectsTable.id,
        title: projectsTable.title,
        description: projectsTable.description,
        category: projectsTable.category,
        status: projectsTable.status,
        progress: projectsTable.progress,
        ownerId: projectsTable.ownerId,
        tags: projectsTable.tags,
        createdAt: projectsTable.createdAt,
        updatedAt: projectsTable.updatedAt,
        ownerName: usersTable.displayName,
      })
      .from(projectsTable)
      .leftJoin(usersTable, eq(projectsTable.ownerId, usersTable.id));

    // Get member counts and membership info for each project
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const memberCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(projectMembersTable)
          .where(eq(projectMembersTable.projectId, project.id));

        const membership = await db
          .select()
          .from(projectMembersTable)
          .where(
            and(
              eq(projectMembersTable.projectId, project.id),
              eq(projectMembersTable.userId, userId)
            )
          )
          .limit(1);

        return {
          ...project,
          ownerName: project.ownerName || "Unknown",
          memberCount: Number(memberCount[0]?.count || 0),
          isMember: membership.length > 0 || project.ownerId === userId,
          tags: project.tags || [],
        };
      })
    );

    res.json(projectsWithDetails);
  } catch (err) {
    console.error("List projects error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* POST /api/projects */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const userId = req.user!.userId;

    if (!title || !description || !category) {
      res.status(400).json({ error: "Bad Request", message: "title, description, and category are required" });
      return;
    }

    const [project] = await db.insert(projectsTable).values({
      title,
      description,
      category,
      status: "planning",
      progress: 0,
      ownerId: userId,
      tags: tags || [],
    }).returning();

    // Add creator as member automatically
    await db.insert(projectMembersTable).values({
      projectId: project.id,
      userId,
    });

    const [owner] = await db.select({ displayName: usersTable.displayName }).from(usersTable).where(eq(usersTable.id, userId));

    res.status(201).json({
      ...project,
      ownerName: owner?.displayName || "Unknown",
      memberCount: 1,
      isMember: true,
      tags: project.tags || [],
    });
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* GET /api/projects/:id */
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const userId = req.user!.userId;

    const [project] = await db
      .select({
        id: projectsTable.id,
        title: projectsTable.title,
        description: projectsTable.description,
        category: projectsTable.category,
        status: projectsTable.status,
        progress: projectsTable.progress,
        ownerId: projectsTable.ownerId,
        tags: projectsTable.tags,
        createdAt: projectsTable.createdAt,
        updatedAt: projectsTable.updatedAt,
        ownerName: usersTable.displayName,
      })
      .from(projectsTable)
      .leftJoin(usersTable, eq(projectsTable.ownerId, usersTable.id))
      .where(eq(projectsTable.id, id));

    if (!project) {
      res.status(404).json({ error: "Not Found", message: "Project not found" });
      return;
    }

    // Get members
    const members = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        displayName: usersTable.displayName,
        grade: usersTable.grade,
        role: usersTable.role,
        bio: usersTable.bio,
        avatarUrl: usersTable.avatarUrl,
        createdAt: usersTable.createdAt,
      })
      .from(projectMembersTable)
      .leftJoin(usersTable, eq(projectMembersTable.userId, usersTable.id))
      .where(eq(projectMembersTable.projectId, id));

    const membership = members.find((m) => m.id === userId);

    res.json({
      ...project,
      ownerName: project.ownerName || "Unknown",
      memberCount: members.length,
      isMember: !!membership || project.ownerId === userId,
      tags: project.tags || [],
      members,
    });
  } catch (err) {
    console.error("Get project error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* PUT /api/projects/:id */
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const userId = req.user!.userId;

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
    if (!project) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    if (project.ownerId !== userId && req.user!.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { title, description, category, status, progress, tags } = req.body;
    const updates: Partial<typeof projectsTable.$inferInsert> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (status !== undefined) updates.status = status;
    if (progress !== undefined) updates.progress = progress;
    if (tags !== undefined) updates.tags = tags;

    const [updated] = await db.update(projectsTable).set(updates).where(eq(projectsTable.id, id)).returning();

    const [owner] = await db.select({ displayName: usersTable.displayName }).from(usersTable).where(eq(usersTable.id, updated.ownerId));
    const memberCount = await db.select({ count: sql<number>`count(*)` }).from(projectMembersTable).where(eq(projectMembersTable.projectId, id));

    res.json({
      ...updated,
      ownerName: owner?.displayName || "Unknown",
      memberCount: Number(memberCount[0]?.count || 0),
      isMember: true,
      tags: updated.tags || [],
    });
  } catch (err) {
    console.error("Update project error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* DELETE /api/projects/:id */
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const userId = req.user!.userId;

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
    if (!project) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    if (project.ownerId !== userId && req.user!.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* POST /api/projects/:id/join */
router.post("/:id/join", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const userId = req.user!.userId;

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
    if (!project) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    const existing = await db
      .select()
      .from(projectMembersTable)
      .where(and(eq(projectMembersTable.projectId, id), eq(projectMembersTable.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(projectMembersTable).values({ projectId: id, userId });
    }

    res.json({ success: true, message: "Joined project" });
  } catch (err) {
    console.error("Join project error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* POST /api/projects/:id/leave */
router.post("/:id/leave", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const userId = req.user!.userId;

    await db
      .delete(projectMembersTable)
      .where(and(eq(projectMembersTable.projectId, id), eq(projectMembersTable.userId, userId)));

    res.json({ success: true, message: "Left project" });
  } catch (err) {
    console.error("Leave project error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* GET /api/projects/:id/comments */
router.get("/:id/comments", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params["id"]!);

    const comments = await db
      .select({
        id: projectCommentsTable.id,
        content: projectCommentsTable.content,
        projectId: projectCommentsTable.projectId,
        userId: projectCommentsTable.userId,
        username: usersTable.username,
        displayName: usersTable.displayName,
        createdAt: projectCommentsTable.createdAt,
      })
      .from(projectCommentsTable)
      .leftJoin(usersTable, eq(projectCommentsTable.userId, usersTable.id))
      .where(eq(projectCommentsTable.projectId, id))
      .orderBy(projectCommentsTable.createdAt);

    res.json(comments);
  } catch (err) {
    console.error("List comments error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* POST /api/projects/:id/comments */
router.post("/:id/comments", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const userId = req.user!.userId;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: "Bad Request", message: "content is required" });
      return;
    }

    const [comment] = await db.insert(projectCommentsTable).values({
      content,
      projectId: id,
      userId,
    }).returning();

    const [user] = await db.select({ username: usersTable.username, displayName: usersTable.displayName })
      .from(usersTable).where(eq(usersTable.id, userId));

    res.status(201).json({
      ...comment,
      username: user?.username,
      displayName: user?.displayName,
    });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* GET /api/projects/:id/experiments */
router.get("/:id/experiments", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params["id"]!);

    const experiments = await db
      .select({
        id: projectExperimentsTable.id,
        title: projectExperimentsTable.title,
        description: projectExperimentsTable.description,
        results: projectExperimentsTable.results,
        fileUrl: projectExperimentsTable.fileUrl,
        projectId: projectExperimentsTable.projectId,
        userId: projectExperimentsTable.userId,
        username: usersTable.username,
        displayName: usersTable.displayName,
        createdAt: projectExperimentsTable.createdAt,
      })
      .from(projectExperimentsTable)
      .leftJoin(usersTable, eq(projectExperimentsTable.userId, usersTable.id))
      .where(eq(projectExperimentsTable.projectId, id))
      .orderBy(projectExperimentsTable.createdAt);

    res.json(experiments);
  } catch (err) {
    console.error("List experiments error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* POST /api/projects/:id/experiments */
router.post("/:id/experiments", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"]!);
    const userId = req.user!.userId;
    const { title, description, results, fileUrl } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: "Bad Request", message: "title and description are required" });
      return;
    }

    const [experiment] = await db.insert(projectExperimentsTable).values({
      title,
      description,
      results: results || null,
      fileUrl: fileUrl || null,
      projectId: id,
      userId,
    }).returning();

    const [user] = await db.select({ username: usersTable.username, displayName: usersTable.displayName })
      .from(usersTable).where(eq(usersTable.id, userId));

    res.status(201).json({
      ...experiment,
      username: user?.username,
      displayName: user?.displayName,
    });
  } catch (err) {
    console.error("Add experiment error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
