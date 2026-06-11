import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, eventsTable } from "@workspace/db";
import {
  ListEventsResponse,
  CreateEventBody,
  GetEventParams,
  GetEventResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/events", async (_req, res): Promise<void> => {
  const events = await db.select().from(eventsTable).orderBy(eventsTable.data);
  res.json(ListEventsResponse.parse(events));
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.insert(eventsTable).values(parsed.data).returning();
  res.status(201).json(GetEventResponse.parse(event));
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetEventParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, params.data.id));
  if (!event) {
    res.status(404).json({ error: "Събитието не е намерено" });
    return;
  }
  res.json(GetEventResponse.parse(event));
});

export default router;
