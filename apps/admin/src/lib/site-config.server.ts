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
    
    // Also fetch settings for activity docs fallback
    let settingsDocs: Record<string, string> = {};
    try {
      const sRows = await sql`
        SELECT key, value FROM settings WHERE key IN ('activity_doc_1', 'activity_doc_2', 'activity_doc_3')
      `;
      sRows.forEach((r: any) => {
        if (r.value) settingsDocs[r.key] = String(r.value);
      });
    } catch {
      // Ignore settings fetch error
    }

    if (rows && rows.length > 0 && rows[0]?.data) {
      const rawData = rows[0].data;
      const data = (typeof rawData === "string" ? JSON.parse(rawData) : rawData) as Partial<SiteAssetsConfig>;
      
      const normalizedFlyers = defaultSiteConfig.flyers.map((defDoc, index) => {
        const existing = data.flyers?.[index];
        const settingVal = settingsDocs[`activity_doc_${index + 1}`] || null;
        const activeUrl = existing?.url || existing?.imageUrl || existing?.flyerUrl || settingVal || null;
        return {
          ...defDoc,
          ...(existing || {}),
          id: defDoc.id,
          title: defDoc.title,
          badge: defDoc.badge,
          venue: defDoc.venue,
          details: defDoc.details,
          url: activeUrl,
          imageUrl: activeUrl,
          flyerUrl: activeUrl,
          isCustom: Boolean(activeUrl),
        };
      });

      return {
        useDynamicAssets: Boolean(data.useDynamicAssets),
        hero: { ...defaultSiteConfig.hero, ...(data.hero || {}) },
        comedians:
          data.comedians && data.comedians.length > 0
            ? data.comedians
            : defaultSiteConfig.comedians,
        flyers: normalizedFlyers,
        documentation: normalizedFlyers,
        merch:
          data.merch && data.merch.length > 0
            ? data.merch
            : defaultSiteConfig.merch,
      };
    }
  } catch (err) {
    console.warn(
      "Could not load dynamic site config from database, using default:",
      err
    );
  }
  return defaultSiteConfig;
}

export async function saveSiteConfig(
  config: SiteAssetsConfig
): Promise<SiteAssetsConfig> {
  try {
    const sql = getSql();

    // Ensure flyers is exactly 3 items
    const normalizedFlyers = defaultSiteConfig.flyers.map((defDoc, index) => {
      const existing = config.flyers?.[index];
      const activeUrl = existing?.url || existing?.imageUrl || existing?.flyerUrl || null;
      return {
        ...defDoc,
        ...(existing || {}),
        id: defDoc.id,
        title: defDoc.title,
        badge: defDoc.badge,
        venue: defDoc.venue,
        details: defDoc.details,
        url: activeUrl,
        imageUrl: activeUrl,
        flyerUrl: activeUrl,
        isCustom: Boolean(activeUrl),
      };
    });

    const finalConfig: SiteAssetsConfig = {
      ...config,
      flyers: normalizedFlyers,
      documentation: normalizedFlyers,
    };

    await sql`
      INSERT INTO site_assets_config (id, data, updated_at)
      VALUES ('current', ${JSON.stringify(finalConfig)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
    `;

    // Also synchronize 3 activity doc slots into settings table
    const doc1 = normalizedFlyers[0]?.url || "";
    const doc2 = normalizedFlyers[1]?.url || "";
    const doc3 = normalizedFlyers[2]?.url || "";

    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('activity_doc_1', ${doc1}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `;
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('activity_doc_2', ${doc2}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `;
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('activity_doc_3', ${doc3}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `;
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('activity_docs', ${JSON.stringify([doc1 || null, doc2 || null, doc3 || null])}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `;

    return finalConfig;
  } catch (err) {
    console.error("Failed to save site config to database:", err);
    return config;
  }
}
