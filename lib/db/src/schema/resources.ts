import { pgTable, text, serial, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("article"),
  imageUrl: text("image_url"),
});

export const insertResourceSchema = createInsertSchema(resourcesTable).omit({ id: true });
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resourcesTable.$inferSelect;
