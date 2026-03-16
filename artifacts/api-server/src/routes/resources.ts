import { Router } from "express";
import { db, resourcesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

/* GET /api/resources */
router.get("/", requireAuth, async (_req, res) => {
  try {
    const resources = await db.select().from(resourcesTable);
    res.json(resources);
  } catch (err) {
    console.error("List resources error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
