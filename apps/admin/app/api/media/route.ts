import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSql } from "../../../src/lib/db";
import { revalidatePath } from "next/cache";

// Configure Cloudinary SDK instance server-side
const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * GET /api/media
 * Fetches Cloudinary media assets with prefix 'stup-timika/', max_results: 12,
 * supporting pagination info (next_cursor, total_count, page numbers).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("next_cursor");
    const maxResultsParam = searchParams.get("max_results");
    const pageParam = searchParams.get("page");
    const maxResults = maxResultsParam ? parseInt(maxResultsParam, 10) : 12;
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;

    // Cloudinary credentials check
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary credentials are not configured" },
        { status: 500 }
      );
    }

    const isAll = searchParams.get("all") === "true";

    // If all=true or page is specified without a cursor, fetch folder resources to compute accurate total_count
    if (isAll || (pageParam && !cursor)) {
      const allRes = await cloudinary.api.resources({
        type: "upload",
        prefix: "stup-timika/",
        max_results: 500,
      });

      const allResources = allRes.resources || [];
      const totalCount = allResources.length;
      const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalCount / maxResults));
      const startIndex = isAll ? 0 : (page - 1) * maxResults;
      const pageItems = isAll
        ? allResources
        : allResources.slice(startIndex, startIndex + maxResults);

      const assets = pageItems.map((r: any) => ({
        id: r.public_id,
        public_id: r.public_id,
        url: r.secure_url,
        secure_url: r.secure_url,
        format: r.format,
        bytes: r.bytes,
        created_at: r.created_at,
        uploadedAt: (r.created_at || "").split("T")[0] || "2026-09-09",
        size: `${(r.bytes / 1024).toFixed(1)} KB`,
        name: r.public_id.split("/").pop() + (r.format ? `.${r.format}` : ""),
        type: r.public_id.includes("/hero")
          ? "BANNER"
          : r.public_id.includes("/flyer")
          ? "FLYER"
          : r.public_id.includes("/comedian") || r.public_id.includes("/headshot")
          ? "HEADSHOT"
          : r.public_id.includes("/partner")
          ? "PARTNER"
          : "DOCUMENTATION",
      }));

      return NextResponse.json({
        assets,
        page: isAll ? 1 : page,
        total_pages: totalPages,
        total_count: totalCount,
        next_cursor: !isAll && startIndex + maxResults < totalCount ? allRes.next_cursor || null : null,
      });
    }

    // Direct cursor-based query
    const cldRes = await cloudinary.api.resources({
      type: "upload",
      prefix: "stup-timika/",
      max_results: maxResults,
      next_cursor: cursor || undefined,
    });

    const assets = (cldRes.resources || []).map((r: any) => ({
      id: r.public_id,
      public_id: r.public_id,
      url: r.secure_url,
      secure_url: r.secure_url,
      format: r.format,
      bytes: r.bytes,
      created_at: r.created_at,
      uploadedAt: (r.created_at || "").split("T")[0] || "2026-09-09",
      size: `${(r.bytes / 1024).toFixed(1)} KB`,
      name: r.public_id.split("/").pop() + (r.format ? `.${r.format}` : ""),
      type: r.public_id.includes("/hero")
        ? "BANNER"
        : r.public_id.includes("/flyer")
        ? "FLYER"
        : r.public_id.includes("/comedian") || r.public_id.includes("/headshot")
        ? "HEADSHOT"
        : r.public_id.includes("/partner")
        ? "PARTNER"
        : "DOCUMENTATION",
    }));

    return NextResponse.json({
      assets,
      next_cursor: cldRes.next_cursor || null,
      total_count: cldRes.total_count ?? assets.length,
    });
  } catch (error: any) {
    console.error("GET /api/media error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Cloudinary media" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media
 * Deletes an asset permanently from Cloudinary storage via public_id,
 * and nullifies any reference in Neon DB (partners, site_assets_config, media_assets).
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const public_id = body.public_id || searchParams.get("public_id");

    if (!public_id) {
      return NextResponse.json({ error: "public_id is required" }, { status: 400 });
    }

    // 1. Destroy asset in Cloudinary
    let destroyResult: any = null;
    if (cloudName && apiKey && apiSecret) {
      destroyResult = await cloudinary.uploader.destroy(public_id, {
        invalidate: true,
      });
    }

    const sql = getSql();

    // 2. Synchronize partners table if logoUrl uses this public_id
    try {
      await sql`
        UPDATE partners
        SET logo_url = ''
        WHERE logo_url LIKE ${"%" + public_id + "%"}
      `;
    } catch (e) {
      console.warn("Could not sync partners table on media delete:", e);
    }

    // 3. Synchronize site_assets_config if referenced
    try {
      const rows =
        await sql`SELECT data FROM site_assets_config WHERE id = 'current' LIMIT 1`;
      if (rows && rows.length > 0 && rows[0]?.data) {
        const rawData = rows[0].data;
        const config =
          typeof rawData === "string" ? JSON.parse(rawData) : rawData;
        let modified = false;

        if (config.hero?.url && config.hero.url.includes(public_id)) {
          config.hero.url = null;
          config.hero.isCustom = false;
          modified = true;
        }

        if (Array.isArray(config.comedians)) {
          config.comedians.forEach((c: any) => {
            if (c.avatarUrl && c.avatarUrl.includes(public_id)) {
              c.avatarUrl = null;
              modified = true;
            }
          });
        }

        if (Array.isArray(config.documentation)) {
          const prevLen = config.documentation.length;
          config.documentation = config.documentation.filter(
            (d: any) => !d.url || !d.url.includes(public_id)
          );
          if (config.documentation.length !== prevLen) modified = true;
        }

        if (Array.isArray(config.flyers)) {
          const prevLen = config.flyers.length;
          config.flyers = config.flyers.filter(
            (f: any) => !f.flyerUrl || !f.flyerUrl.includes(public_id)
          );
          if (config.flyers.length !== prevLen) modified = true;
        }

        if (modified) {
          await sql`
            UPDATE site_assets_config
            SET data = ${JSON.stringify(config)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = 'current'
          `;
        }
      }
    } catch (e) {
      console.warn("Could not sync site_assets_config on media delete:", e);
    }

    // 4. Synchronize media_assets cache table
    try {
      await sql`
        DELETE FROM media_assets
        WHERE url LIKE ${"%" + public_id + "%"} OR id = ${public_id}
      `;
    } catch (e) {
      console.warn("Could not delete from media_assets table:", e);
    }

    revalidatePath("/media");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: `Asset ${public_id} successfully deleted from Cloudinary storage and synchronized with database`,
      result: destroyResult,
    });
  } catch (error: any) {
    console.error("DELETE /api/media error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete Cloudinary media" },
      { status: 500 }
    );
  }
}
