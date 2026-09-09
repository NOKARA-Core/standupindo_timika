export interface HeroAssetConfig {
  url: string | null;
  tag: string;
  subtag: string;
  title: string;
  subtitle: string;
  badge: string;
  isCustom: boolean;
}

export interface ComedianAssetConfig {
  id: string;
  name: string;
  badge: string;
  description: string;
  avatarUrl: string | null;
  isCustom: boolean;
}

export interface FlyerAssetConfig {
  id: string;
  title: string;
  date: string;
  venue: string;
  details: string;
  flyerUrl: string | null;
  isCustom: boolean;
}

export interface MerchAssetConfig {
  id: string;
  name: string;
  price: string;
  description: string;
  badge: string;
  imageUrl: string | null;
  isCustom: boolean;
}

export interface SiteAssetsConfig {
  useDynamicAssets: boolean;
  hero: HeroAssetConfig;
  comedians: ComedianAssetConfig[];
  flyers: FlyerAssetConfig[];
  merch: MerchAssetConfig[];
}

export const defaultSiteConfig: SiteAssetsConfig = {
  useDynamicAssets: false,
  hero: {
    url: null,
    tag: "PAPUA UNDERGROUND",
    subtag: "EST. TIMIKA",
    title: "STANDUPINDO",
    subtitle: "TIMIKA CHAPTER",
    badge: "SOLID • SPONTAN • SAKIT PERUT",
    isCustom: false,
  },
  comedians: [
    {
      id: "dimas",
      name: "DIMAS",
      badge: "DEADPAN",
      description:
        "Master of awkward silences and brutal observations about Timika traffic.",
      avatarUrl: null,
      isCustom: false,
    },
    {
      id: "tika",
      name: "TIKA",
      badge: "OBSERVATIONAL",
      description:
        "Rapid-fire punchlines dissecting modern relationships and local cafe culture.",
      avatarUrl: null,
      isCustom: false,
    },
    {
      id: "rian",
      name: "RIAN",
      badge: "ROAST",
      description:
        "No one is safe. If you sit in the front row, you're part of the set.",
      avatarUrl: null,
      isCustom: false,
    },
  ],
  flyers: [
    {
      id: "grind-42",
      title: "THE GRIND (OPEN MIC)",
      date: "FRI, OCT 13 - 8 PM",
      venue: "THE BUNKER",
      details: "JL. YOS SUDARSO • HOST: RIAN 'THE HAMMER'",
      flyerUrl: null,
      isCustom: false,
    },
    {
      id: "neon-night",
      title: "TIMIKA STANDUP NIGHT",
      date: "SAT, OCT 14 - 9 PM",
      venue: "NEON CAFE",
      details: "SP2 • HOST: TIKA 'NO FILTER'",
      flyerUrl: null,
      isCustom: false,
    },
  ],
  merch: [
    {
      id: "tee-01",
      name: "'LIVE RAW' TEE",
      price: "Rp 150k",
      description:
        "Heavyweight cotton. Wash cold. Don't iron the print. Wear it to a gig.",
      badge: "HEAVYWEIGHT 24S",
      imageUrl: null,
      isCustom: false,
    },
    {
      id: "mug-01",
      name: "BITTER MUG",
      price: "Rp 80k",
      description:
        "Holds 12oz of black coffee. Or whatever liquid gets you through the set.",
      badge: "CERAMIC 12OZ",
      imageUrl: null,
      isCustom: false,
    },
  ],
};

export async function getSiteConfig(): Promise<SiteAssetsConfig> {
  // During next build phase or when offline, fallback immediately to default static assets
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return defaultSiteConfig;
  }

  // On deployed environments (like Vercel), do not attempt to reach localhost
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  const isDev = process.env.NODE_ENV === "development";

  if (!adminUrl && !isDev) {
    return defaultSiteConfig;
  }

  const targetUrl = adminUrl || "http://localhost:5001";

  try {
    const res = await fetch(`${targetUrl}/api/site-config`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as Partial<SiteAssetsConfig>;
      if (data && data.useDynamicAssets) {
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
    }
  } catch {
    // If admin is unreachable, smoothly return default static assets
  }

  return defaultSiteConfig;
}
