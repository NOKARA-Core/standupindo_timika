import { NextResponse } from "next/server";
import { getSiteConfig } from "../../../src/lib/site-config.server";

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json(config);
}
