import "server-only";
import { getSql } from "./db";
import { SiteAssetsConfig, defaultSiteConfig } from "./site-config";

export async function getSiteConfig(): Promise<SiteAssetsConfig> {
  // During next build phase, return default config to avoid hanging database sockets
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return defaultSiteConfig;
  }

  try {
    const sql = getSql();
    const rows =
      await sql`SELECT data FROM site_assets_config WHERE id = 'current' LIMIT 1`;
    if (rows && rows.length > 0 && rows[0]?.data) {
      const data = rows[0].data as Partial<SiteAssetsConfig>;
      // If dynamic assets disabled, always enforce default fallback!
      if (!data.useDynamicAssets) {
        return defaultSiteConfig;
      }
      return {
        useDynamicAssets: true,
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
    console.warn("Using fallback static assets for web app:", err);
  }
  return defaultSiteConfig;
}
