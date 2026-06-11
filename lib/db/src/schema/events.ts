import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  zaglavia: text("zaglavia").notNull(),
  data: text("data").notNull(),
  vid: text("vid").notNull(),
  opisanie: text("opisanie").notNull(),
  myasto: text("myasto"),
  organizator: text("organizator"),
  linkRegistraciya: text("link_registraciya"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
