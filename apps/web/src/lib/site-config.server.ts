import "server-only";
import { getSql } from "./db";
import { SiteAssetsConfig, defaultSiteConfig } from "./site-config";

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
