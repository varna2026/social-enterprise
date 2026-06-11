import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const enterprisesTable = pgTable("enterprises", {
  id: serial("id").primaryKey(),
  naimenovanie: text("naimenovanie").notNull(),
  eik: text("eik"),
  oblast: text("oblast").notNull(),
  grad: text("grad").notNull(),
  adres: text("adres"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  klas: text("klas").notNull(),
  pravnaForma: text("pravna_forma").notNull(),
  ikonomicheskaDeynost: text("ikonomicheska_deynost").notNull(),
  celevnaGrupa: text("celevna_grupa").notNull(),
  socialnaKauza: text("sotsialna_kauza").notNull(),
  socialnaInovaciya: text("sotsialna_inovaciya"),
  kratkoOpisanie: text("kratko_opisanie").notNull(),
  misiya: text("misiya"),
  telefon: text("telefon"),
  email: text("email"),
  website: text("website"),
  facebook: text("facebook"),
  logoUrl: text("logo_url"),
  producti: text("producti"),
  uslugi: text("uslugi"),
  broyZaeti: integer("broy_zaeti"),
  broyUyazvimiLica: integer("broy_uyazvimi_lica"),
  godinaZastoyvane: integer("godina_zastoyvane"),
  istoriyaNaUspeha: text("istoriya_na_uspeha"),
  images: text("images"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEnterpriseSchema = createInsertSchema(enterprisesTable).omit({ id: true, createdAt: true });
export type InsertEnterprise = z.infer<typeof insertEnterpriseSchema>;
export type Enterprise = typeof enterprisesTable.$inferSelect;
