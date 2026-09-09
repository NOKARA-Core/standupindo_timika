import "server-only";
import { getSql } from "./db";
import {
  SiteAssetsConfig,
  defaultSiteConfig,
  WebPartnerItem,
  defaultWebPartners,
} from "./site-config";

export type { WebPartnerItem };
export { defaultWebPartners };

export async function getPartnersFromDB(): Promise<WebPartnerItem[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return defaultWebPartners;
  }
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, name, logo_url as "logoUrl", website_url as "websiteUrl", sort_order as "sortOrder"
      FROM partners
      WHERE is_active = true
      ORDER BY sort_order ASC, created_at ASC
    `;
    if (rows && rows.length > 0) {
      return rows as unknown as WebPartnerItem[];
    }
  } catch (err) {
    console.warn("Could not load partners from database:", err);
  }
  return defaultWebPartners;
}

export async function getMediaSettingsFromDB(): Promise<SiteAssetsConfig> {
  // During next build phase, return default config to avoid hanging database sockets
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return defaultSiteConfig;
  }

  try {
    const sql = getSql();
    const rows =
      await sql`SELECT data FROM site_assets_config WHERE id = 'current' LIMIT 1`;
    if (rows && rows.length > 0 && rows[0]?.data) {
      const rawData = rows[0].data;
      const data = (typeof rawData === "string" ? JSON.parse(rawData) : rawData) as Partial<SiteAssetsConfig>;
      return {
        useDynamicAssets: Boolean(data.useDynamicAssets),
        useDynamicPartners: data.useDynamicPartners !== false,
        hero: { ...defaultSiteConfig.hero, ...(data.hero || {}) },
        comedians:
          data.comedians && data.comedians.length > 0
            ? data.comedians
            : defaultSiteConfig.comedians,
        flyers:
          data.flyers && data.flyers.length > 0
            ? data.flyers
            : defaultSiteConfig.flyers,
        merch:
          data.merch && data.merch.length > 0
            ? data.merch
            : defaultSiteConfig.merch,
      };
    }
  } catch (err) {
    console.warn(
      "Could not load dynamic site config from database in apps/web, using default:",
      err
    );
  }
  return defaultSiteConfig;
}
