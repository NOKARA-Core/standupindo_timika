import { NextResponse } from "next/server";
import { SiteAssetsConfig } from "../../../src/lib/site-config";
import { getSiteConfig, saveSiteConfig } from "../../../src/lib/site-config.server";
import { requireAdminSession } from "../../../src/lib/auth";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.response) return auth.response;

  const config = await getSiteConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession("superadmin");
    if (auth.response) return auth.response;

    const body = (await request.json()) as Partial<SiteAssetsConfig>;
    const current = await getSiteConfig();

    const updated: SiteAssetsConfig = {
      useDynamicAssets:
        typeof body.useDynamicAssets === "boolean"
          ? body.useDynamicAssets
          : current.useDynamicAssets,
      hero: body.hero ? { ...current.hero, ...body.hero } : current.hero,
      comedians: body.comedians || current.comedians,
      flyers: body.flyers || current.flyers,
      merch: body.merch || current.merch,
    };

    const saved = await saveSiteConfig(updated);
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/media");
      revalidatePath("/");
    } catch {
      // Ignore cache revalidation errors
    }
    return NextResponse.json({ success: true, config: saved });
  } catch (error) {
    console.error("API error updating site config:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

