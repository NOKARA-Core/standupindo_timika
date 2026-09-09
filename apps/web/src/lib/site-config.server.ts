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

export interface DBComedian {
  id: string;
  realName?: string;
  stageName: string;
  comedyStyle: string;
  punchline: string;
  bio: string;
  phone?: string | null;
  totalOpenMic: number;
  isActive: boolean;
  avatarUrl?: string | null;
}

export interface DBMerchandise {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string | null;
  description?: string | null;
  badge?: string | null;
  isActive: boolean;
}

export interface DBEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
  host?: string;
  price?: string;
  taptapUrl?: string | null;
  status: string;
  flyerUrl?: string | null;
}

export const defaultWebEvents: DBEvent[] = [
  {
    id: "grind-01",
    type: "OPEN MIC",
    title: "THE GRIND VOL. 42",
    date: "2026-10-13",
    time: "20:00 WIT",
    venue: "THE BUNKER",
    address: "Jl. Yos Sudarso No. 18, Timika",
    host: "RIAN 'THE HAMMER'",
    price: "FREE ENTRY / F&B",
    taptapUrl: "https://taptap.id/e/stup-timika-grind-42",
    status: "REGISTRATION OPEN",
  },
  {
    id: "grind-02",
    type: "OPEN MIC",
    title: "THE GRIND: NEWBLOOD EDITION",
    date: "2026-10-14",
    time: "21:00 WIT",
    venue: "NEON CAFE",
    address: "SP2 Jalur 3, Timika",
    host: "TIKA 'NO FILTER'",
    price: "FREE ENTRY",
    taptapUrl: "https://taptap.id/e/stup-timika-newblood",
    status: "REGISTRATION OPEN",
  },
  {
    id: "grind-03",
    type: "OPEN MIC",
    title: "ACOUSTIC & COMEDY NIGHT",
    date: "2026-10-18",
    time: "19:30 WIT",
    venue: "KOPI & TAWA",
    address: "Jl. Timika Indah No. 4, Timika",
    host: "DIMAS",
    price: "FREE ENTRY",
    taptapUrl: "https://taptap.id/e/stup-timika-kopi-tawa",
    status: "REGISTRATION OPEN",
  },
  {
    id: "special-01",
    type: "SPECIAL SHOW",
    title: "RIAN: 'ROASTING TIMIKA'",
    date: "2026-11-04",
    time: "19:00 WIT",
    venue: "GEDUNG EME NEME YAUWARE",
    address: "Jl. Budi Utomo, Timika",
    host: "DIMAS & TIKA",
    price: "RP 75.000 (EARLY BIRD)",
    taptapUrl: "https://taptap.id/e/rian-roasting-timika",
    status: "TICKETS AVAILABLE",
  },
  {
    id: "special-02",
    type: "SPECIAL SHOW",
    title: "STANDUP FEST MIMIKA 2026",
    date: "2026-12-12",
    time: "18:30 WIT",
    venue: "BALLROOM HOTEL HORISON TIMIKA",
    address: "Jl. Hasanuddin No. 9, Timika",
    host: "ALL TIMIKA ROSTER + NATIONAL GUEST",
    price: "RP 120.000",
    taptapUrl: "https://taptap.id/e/standup-fest-mimika",
    status: "LIMITED SEATS",
  },
];

export const defaultWebComedians: DBComedian[] = [
  {
    id: "dimas",
    stageName: "DIMAS",
    comedyStyle: "Observational",
    punchline: "Master of awkward silences and brutal observations about Timika traffic.",
    bio: "Membawa keresahan hidup anak perantau di pelosok Papua dengan gaya deadpan dingin tanpa ekspresi.",
    totalOpenMic: 24,
    isActive: true,
    avatarUrl: null,
  },
  {
    id: "tika",
    stageName: "TIKA",
    comedyStyle: "Storytelling",
    punchline: "Rapid-fire punchlines dissecting modern relationships and local cafe culture.",
    bio: "Pencerita ulung yang membongkar realita pacaran dan obrolan tongkrongan Timika yang relatable.",
    totalOpenMic: 31,
    isActive: true,
    avatarUrl: null,
  },
  {
    id: "rian",
    stageName: "RIAN",
    comedyStyle: "Dark Comedy",
    punchline: "No one is safe. If you sit in the front row, you're part of the set.",
    bio: "Raja roast battle Timika dengan punchline tajam yang menguji mental penonton baris depan.",
    totalOpenMic: 42,
    isActive: true,
    avatarUrl: null,
  },
  {
    id: "yosua",
    stageName: "YOSUA",
    comedyStyle: "Absurd",
    punchline: "Logika terbalik dan premis tak terduga yang bikin mikir dua kali.",
    bio: "Eksplorasi humor surealis dan analogi absurd yang membengkokkan akal sehat dengan tawa renyah.",
    totalOpenMic: 18,
    isActive: true,
    avatarUrl: null,
  },
  {
    id: "budi-k",
    stageName: "BUDI K.",
    comedyStyle: "Observational",
    punchline: "Menertawakan birokrasi dan harga tiket pesawat pedalaman Papua.",
    bio: "Spesialis komedi keresahan harian, harga sembako, dan perjuangan sinyal di pelosok Mimika.",
    totalOpenMic: 29,
    isActive: true,
    avatarUrl: null,
  },
  {
    id: "samuel",
    stageName: "SAMUEL",
    comedyStyle: "Storytelling",
    punchline: "Kisah nyata masa kecil pesisir dengan tempo lambat tapi meledak.",
    bio: "Menghadirkan nostalgia kampung halaman dan kehangatan tawa khas Indonesia Timur yang otentik.",
    totalOpenMic: 20,
    isActive: true,
    avatarUrl: null,
  },
];

export const defaultWebMerchandise: DBMerchandise[] = [
  {
    id: "tee-liveraw",
    name: "'LIVE RAW' HEAVYWEIGHT TEE",
    category: "T-Shirt",
    price: 150000,
    stock: 25,
    description: "Cotton Combed 24s Heavyweight, sablon plastisol doff kasar tahan banting. Cuttingan boxy fit underground.",
    badge: "BESTSELLER",
    imageUrl: null,
    isActive: true,
  },
  {
    id: "hoodie-underground",
    name: "TIMIKA CHAPTER HEAVY HOODIE",
    category: "Hoodie",
    price: 320000,
    stock: 15,
    description: "Fleece 330gsm tebal cocok untuk hawa dingin malam Mimika. Grafis bordir punchline di dada dan punggung.",
    badge: "LIMITED EDITION",
    imageUrl: null,
    isActive: true,
  },
  {
    id: "mug-bitter",
    name: "THE BITTER COMEDIAN MUG",
    category: "Aksesoris",
    price: 80000,
    stock: 40,
    description: "Keramik hitam doff 12oz. Menampung kopi pahit untuk menemani kamu nulis premis sampai subuh.",
    badge: "OFFICIAL MERCH",
    imageUrl: null,
    isActive: true,
  },
  {
    id: "sticker-pack",
    name: "STANDUP TIMIKA STICKER PACK (10 PCS)",
    category: "Aksesoris",
    price: 35000,
    stock: 100,
    description: "Vinyl waterproof die-cut tebal. Desain quote komika, logo retro, dan lambang petir komedi lokal.",
    badge: "PACK",
    imageUrl: null,
    isActive: true,
  },
  {
    id: "ticket-special-preorder",
    name: "PRE-ORDER TICKET: STANDUP FEST MIMIKA",
    category: "Tiket",
    price: 100000,
    stock: 50,
    description: "Akses VIP Presale + Merchandise bundle wristband eksklusif StandUp Festival Mimika akhir tahun.",
    badge: "EARLY ACCESS",
    imageUrl: null,
    isActive: true,
  },
  {
    id: "tote-canvas",
    name: "RAW PUNCHLINE CANVAS TOTE",
    category: "Aksesoris",
    price: 65000,
    stock: 30,
    description: "Kanvas tebal 14oz berresleting. Kuat bawa laptop dan buku catatan materi stand-up.",
    badge: "NEW ARRIVAL",
    imageUrl: null,
    isActive: true,
  },
];

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

export async function getComediansFromDB(): Promise<DBComedian[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return defaultWebComedians;
  }
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        id,
        real_name as "realName",
        stage_name as "stageName",
        comedy_style as "comedyStyle",
        punchline,
        bio,
        phone,
        total_open_mic as "totalOpenMic",
        is_active as "isActive",
        avatar_url as "avatarUrl"
      FROM comedians
      WHERE is_active = true
      ORDER BY stage_name ASC
    `;
    if (rows && rows.length > 0) {
      return rows as unknown as DBComedian[];
    }
  } catch (err) {
    console.warn("Could not load comedians from database:", err);
  }
  return defaultWebComedians;
}

export async function getMerchandiseFromDB(): Promise<DBMerchandise[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return defaultWebMerchandise;
  }
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        id,
        name,
        price::float as price,
        category,
        stock,
        image_url as "imageUrl",
        description,
        badge,
        is_active as "isActive"
      FROM merchandise
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    if (rows && rows.length > 0) {
      return rows as unknown as DBMerchandise[];
    }
  } catch (err) {
    console.warn("Could not load merchandise from database:", err);
  }
  return defaultWebMerchandise;
}

export async function getEventsFromDB(): Promise<DBEvent[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return defaultWebEvents;
  }
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        id,
        title,
        type,
        date,
        time,
        venue,
        address,
        host,
        price,
        taptap_url as "taptapUrl",
        status,
        flyer_url as "flyerUrl"
      FROM events
      WHERE status != 'DRAFT'
      ORDER BY date ASC, time ASC
    `;
    if (rows && rows.length > 0) {
      return rows as unknown as DBEvent[];
    }
  } catch (err) {
    console.warn("Could not load events from database:", err);
  }
  return defaultWebEvents;
}

export async function getWhatsAppOrderNumberFromDB(): Promise<string> {
  const defaultNumber = "6282248566675";
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return defaultNumber;
  }
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT value
      FROM settings
      WHERE key = 'whatsapp_order_number'
      LIMIT 1
    `;
    if (rows && rows.length > 0 && rows[0]?.value) {
      return String(rows[0].value).trim();
    }
  } catch (err) {
    console.warn("Could not load WhatsApp number from settings:", err);
  }
  return defaultNumber;
}

export async function getMediaSettingsFromDB(): Promise<SiteAssetsConfig> {
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
        useDynamicPartners: data.useDynamicPartners !== false,
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
      "Could not load dynamic site config from database in apps/web, using default:",
      err
    );
  }
  return defaultSiteConfig;
}
