import { Router, type IRouter } from "express";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { db, enterprisesTable } from "@workspace/db";
import {
  ListEnterprisesQueryParams,
  ListEnterprisesResponse,
  CreateEnterpriseBody,
  GetEnterpriseParams,
  GetEnterpriseResponse,
  UpdateEnterpriseParams,
  UpdateEnterpriseBody,
  UpdateEnterpriseResponse,
  DeleteEnterpriseParams,
  GetEnterpriseStatsResponse,
  GetEnterprisesByOblastResponse,
  GetEnterprisesBySectorResponse,
  GetEnterprisesByKauzaResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/enterprises/stats/summary", async (_req, res): Promise<void> => {
  const enterprises = await db.select().from(enterprisesTable);
  const totalEnterprises = enterprises.length;
  const totalZaeti = enterprises.reduce((s, e) => s + (e.broyZaeti ?? 0), 0);
  const totalUyazvimiLica = enterprises.reduce((s, e) => s + (e.broyUyazvimiLica ?? 0), 0);
  const totalInovacii = enterprises.filter((e) => e.socialnaInovaciya).length;
  const totalKauzi = new Set(enterprises.map((e) => e.socialnaKauza)).size;

  res.json(GetEnterpriseStatsResponse.parse({
    totalEnterprises,
    totalZaeti,
    totalUyazvimiLica,
    totalInovacii,
    totalKauzi,
    totalSabytiya: 0,
  }));
});

router.get("/enterprises/stats/by-oblast", async (_req, res): Promise<void> => {
  const result = await db
    .select({
      oblast: enterprisesTable.oblast,
      count: sql<number>`count(*)::int`,
    })
    .from(enterprisesTable)
    .groupBy(enterprisesTable.oblast)
    .orderBy(enterprisesTable.oblast);
  res.json(GetEnterprisesByOblastResponse.parse(result));
});

router.get("/enterprises/stats/by-sector", async (_req, res): Promise<void> => {
  const result = await db
    .select({
      sector: enterprisesTable.ikonomicheskaDeynost,
      count: sql<number>`count(*)::int`,
    })
    .from(enterprisesTable)
    .groupBy(enterprisesTable.ikonomicheskaDeynost)
    .orderBy(enterprisesTable.ikonomicheskaDeynost);
  res.json(GetEnterprisesBySectorResponse.parse(result));
});

router.get("/enterprises/stats/by-kauza", async (_req, res): Promise<void> => {
  const result = await db
    .select({
      kauza: enterprisesTable.socialnaKauza,
      count: sql<number>`count(*)::int`,
    })
    .from(enterprisesTable)
    .groupBy(enterprisesTable.socialnaKauza)
    .orderBy(enterprisesTable.socialnaKauza);
  res.json(GetEnterprisesByKauzaResponse.parse(result));
});

router.get("/enterprises", async (req, res): Promise<void> => {
  const parsed = ListEnterprisesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, oblast, klas, pravnaForma, ikonomicheskaDeynost, celevGrupa, socialnaKauza, socialnaInovaciya } = parsed.data;

  const conditions = [];
  if (oblast) conditions.push(eq(enterprisesTable.oblast, oblast));
  if (klas) conditions.push(eq(enterprisesTable.klas, klas));
  if (pravnaForma) conditions.push(eq(enterprisesTable.pravnaForma, pravnaForma));
  if (ikonomicheskaDeynost) conditions.push(eq(enterprisesTable.ikonomicheskaDeynost, ikonomicheskaDeynost));
  if (celevGrupa) conditions.push(eq(enterprisesTable.celevnaGrupa, celevGrupa));
  if (socialnaKauza) conditions.push(eq(enterprisesTable.socialnaKauza, socialnaKauza));
  if (socialnaInovaciya) conditions.push(eq(enterprisesTable.socialnaInovaciya, socialnaInovaciya));
  if (search) {
    conditions.push(
      or(
        ilike(enterprisesTable.naimenovanie, `%${search}%`),
        ilike(enterprisesTable.grad, `%${search}%`),
        ilike(enterprisesTable.kratkoOpisanie, `%${search}%`),
      )!
    );
  }

  const enterprises = conditions.length > 0
    ? await db.select().from(enterprisesTable).where(and(...conditions)).orderBy(enterprisesTable.naimenovanie)
    : await db.select().from(enterprisesTable).orderBy(enterprisesTable.naimenovanie);

  res.json(ListEnterprisesResponse.parse(enterprises));
});

router.post("/enterprises", async (req, res): Promise<void> => {
  const parsed = CreateEnterpriseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [enterprise] = await db.insert(enterprisesTable).values(parsed.data).returning();
  res.status(201).json(GetEnterpriseResponse.parse(enterprise));
});

router.get("/enterprises/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetEnterpriseParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [enterprise] = await db.select().from(enterprisesTable).where(eq(enterprisesTable.id, params.data.id));
  if (!enterprise) {
    res.status(404).json({ error: "Предприятието не е намерено" });
    return;
  }
  res.json(GetEnterpriseResponse.parse(enterprise));
});

router.patch("/enterprises/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateEnterpriseParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEnterpriseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [enterprise] = await db.update(enterprisesTable).set(parsed.data).where(eq(enterprisesTable.id, params.data.id)).returning();
  if (!enterprise) {
    res.status(404).json({ error: "Предприятието не е намерено" });
    return;
  }
  res.json(UpdateEnterpriseResponse.parse(enterprise));
});

router.delete("/enterprises/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteEnterpriseParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [enterprise] = await db.delete(enterprisesTable).where(eq(enterprisesTable.id, params.data.id)).returning();
  if (!enterprise) {
    res.status(404).json({ error: "Предприятието не е намерено" });
    return;
  }
  res.sendStatus(204);
});

export default router;
