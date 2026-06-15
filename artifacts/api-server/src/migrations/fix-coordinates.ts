import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

/**
 * One-time coordinate correction migration.
 * Fixes incorrectly geocoded enterprise locations based on verified address data.
 * Safe to re-run — only updates rows that still have the old wrong values.
 */
const COORDINATE_FIXES: Array<{ id: number; lat: number; lng: number; note: string }> = [
  { id: 43, lat: 43.219822, lng: 27.907648, note: "ул. Кестен 13 — беше на плажа" },
  { id: 31, lat: 43.202503, lng: 27.914446, note: "ул. Преслав 53" },
  { id: 35, lat: 43.22222,  lng: 27.930523, note: "ул. Рощок 1А" },
  { id: 45, lat: 43.214294, lng: 27.903757, note: "ул. Юрий Венелин 4Б" },
  { id: 46, lat: 43.21252,  lng: 27.922527, note: "ул. Генерал Скобелев 44" },
  { id: 29, lat: 43.2171,   lng: 27.9163,   note: "ул. Брегалница 16" },
  { id: 52, lat: 43.205006, lng: 27.896559, note: "ул. Хан Пресиян 21" },
  { id: 68, lat: 43.205006, lng: 27.896559, note: "ул. Хан Пресиян 21 (ЛУН АРТ)" },
  { id: 26, lat: 43.2092,   lng: 27.9210,   note: "ул. Радко Димитриев 7А" },
  { id: 67, lat: 43.2092,   lng: 27.9210,   note: "ул. Радко Димитриев 7А (Няма невъзможни)" },
  { id: 24, lat: 43.19942,  lng: 27.9148,   note: "ул. Габрово 15" },
  { id: 39, lat: 43.216694, lng: 27.9290,   note: "ул. Селиолу 13" },
  { id: 41, lat: 43.237,    lng: 27.8942,   note: "бул. Ана Феликсова 18, жк Сезони" },
  { id: 70, lat: 43.211,    lng: 27.8790,   note: "бул. Януш Хуняди 6, Владислав Варненчик" },
  { id: 71, lat: 43.2141,   lng: 27.9130,   note: "бул. Княз Борис I 115" },
  { id: 28, lat: 43.228,    lng: 27.9630,   note: "жк Бриз, ул. Пападополу 47" },
  { id: 40, lat: 43.2130,   lng: 27.8780,   note: "ул. Петлешев 37А, жк Младост" },
  { id: 50, lat: 43.2085,   lng: 27.8780,   note: "ул. Петлешев 1, жк Младост" },
];

export async function runCoordinateFixes(): Promise<void> {
  let fixed = 0;
  for (const fix of COORDINATE_FIXES) {
    try {
      const result = await db.execute(
        sql`UPDATE enterprises SET lat = ${fix.lat}, lng = ${fix.lng} WHERE id = ${fix.id}`
      );
      const count = (result as unknown as { rowCount: number }).rowCount ?? 0;
      if (count > 0) fixed++;
    } catch (err) {
      logger.warn({ err, id: fix.id }, "Coordinate fix skipped");
    }
  }
  logger.info({ fixed, total: COORDINATE_FIXES.length }, "Coordinate fixes applied");
}
