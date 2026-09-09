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

export interface DocumentationAssetConfig {
  id: string;
  title: string;
  badge?: string;
  date?: string;
  venue?: string;
  details?: string;
  flyerUrl: string | null;
  imageUrl?: string | null;
  isCustom: boolean;
}

export type FlyerAssetConfig = DocumentationAssetConfig;

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
  useDynamicPartners?: boolean;
  hero: HeroAssetConfig;
  comedians: ComedianAssetConfig[];
  flyers: DocumentationAssetConfig[];
  documentation?: DocumentationAssetConfig[];
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
      id: "doc-origin",
      title: "FIRST OPEN MIC IN MIMIKA (2018)",
      badge: "ORIGIN STORY",
      date: "2018",
      venue: "WARUNG KOPI YOS SUDARSO",
      details: "Bermula dari 5 orang berkumpul di warung kopi Jalan Yos Sudarso dengan satu mic kabel.",
      flyerUrl: null,
      imageUrl: null,
      isCustom: false,
    },
    {
      id: "doc-milestone",
      title: "100+ JAM TERTAWA",
      badge: "MILESTONE",
      date: "150+ SHOWS",
      venue: "TIMIKA CAFE CIRCUIT",
      details: "Lebih dari 150 kali open mic digelar di berbagai kafe dan sudut kota Timika.",
      flyerUrl: null,
      imageUrl: null,
      isCustom: false,
    },
    {
      id: "doc-network",
      title: "KOLABORASI KOMIKA NASIONAL",
      badge: "NETWORK",
      date: "SPECIAL TOURS",
      venue: "EME NEME YAUWARE",
      details: "Membawa nama-nama besar stand-up comedy Indonesia untuk tampil langsung menghibur masyarakat Timika.",
      flyerUrl: null,
      imageUrl: null,
      isCustom: false,
    },
    {
      id: "doc-movement",
      title: "REGENERASI KOMIKA PAPUA",
      badge: "MOVEMENT",
      date: "ANNUAL MOVEMENT",
      venue: "MIMIKA CULTURAL HUB",
      details: "Secara konsisten membina dan melahirkan bakat-bakat muda asli Timika untuk berani bersuara.",
      flyerUrl: null,
      imageUrl: null,
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
