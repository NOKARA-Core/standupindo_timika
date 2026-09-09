// Mock data layer ready for Supabase table migration

export interface EventItem {
  id: string;
  title: string;
  type: "OPEN MIC" | "SPECIAL SHOW";
  date: string;
  time: string;
  venue: string;
  address: string;
  host: string;
  price: string;
  taptapUrl: string;
  status: "PUBLISHED" | "DRAFT" | "TAPTAP LIVE" | "CLOSED";
  flyerUrl?: string;
  capacity?: number;
  registeredCount?: number;
}

export interface ComedianItem {
  id: string;
  realName: string;
  stageName: string;
  comedyStyle: "Observational" | "Storytelling" | "Dark Comedy" | "Absurd";
  punchline: string;
  bio: string;
  phone: string;
  totalOpenMic: number;
  isActive: boolean;
  avatarUrl?: string;
  isFeaturedLineup?: boolean;
  lineupOrder?: number;
}

export interface OpenMicRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  comedianName: string;
  phone: string;
  notes: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: "BANNER" | "FLYER" | "HEADSHOT" | "DOCUMENTATION" | "PARTNER";
  size: string;
  url: string;
  uploadedAt: string;
  public_id?: string;
}

export interface ActivityMetric {
  month: string;
  shows: number;
  performers: number;
  audience: number;
}

// Initial Mock Database
export const initialEvents: EventItem[] = [
  {
    id: "evt-01",
    title: "THE GRIND VOL. 42",
    type: "OPEN MIC",
    date: "2026-10-13",
    time: "20:00 WIT",
    venue: "THE BUNKER",
    address: "Jl. Yos Sudarso No. 18, Timika",
    host: "RIAN 'THE HAMMER'",
    price: "FREE ENTRY / F&B",
    taptapUrl: "https://taptap.id/e/stup-timika-grind-42",
    status: "TAPTAP LIVE",
    capacity: 60,
    registeredCount: 48,
    flyerUrl: "/flyers/grind-42.jpg",
  },
  {
    id: "evt-02",
    title: "THE GRIND: NEWBLOOD EDITION",
    type: "OPEN MIC",
    date: "2026-10-14",
    time: "21:00 WIT",
    venue: "NEON CAFE",
    address: "SP2 Jalur 3, Timika",
    host: "TIKA 'NO FILTER'",
    price: "FREE ENTRY",
    taptapUrl: "https://taptap.id/e/stup-timika-newblood",
    status: "PUBLISHED",
    capacity: 40,
    registeredCount: 32,
  },
  {
    id: "evt-03",
    title: "RIAN: 'ROASTING TIMIKA' SPECIAL",
    type: "SPECIAL SHOW",
    date: "2026-11-04",
    time: "19:00 WIT",
    venue: "GEDUNG EME NEME YAUWARE",
    address: "Jl. Budi Utomo, Timika",
    host: "DIMAS & TIKA",
    price: "RP 75.000",
    taptapUrl: "https://taptap.id/e/rian-roasting-timika",
    status: "TAPTAP LIVE",
    capacity: 250,
    registeredCount: 195,
  },
  {
    id: "evt-04",
    title: "STANDUP FEST MIMIKA 2026",
    type: "SPECIAL SHOW",
    date: "2026-12-12",
    time: "18:30 WIT",
    venue: "HOTEL HORISON TIMIKA",
    address: "Jl. Hasanuddin No. 9, Timika",
    host: "ALL TIMIKA ROSTER",
    price: "RP 120.000",
    taptapUrl: "",
    status: "DRAFT",
    capacity: 400,
    registeredCount: 0,
  },
];

export const initialComedians: ComedianItem[] = [
  {
    id: "com-01",
    realName: "Dimas Prasetyo",
    stageName: "DIMAS",
    comedyStyle: "Observational",
    punchline: "Master of awkward silences and brutal observations about Timika traffic.",
    bio: "Membawa keresahan hidup anak perantau di pelosok Papua dengan gaya deadpan dingin.",
    phone: "+6281234567891",
    totalOpenMic: 24,
    isActive: true,
  },
  {
    id: "com-02",
    realName: "Kartika Sari",
    stageName: "TIKA",
    comedyStyle: "Storytelling",
    punchline: "Rapid-fire punchlines dissecting modern relationships and local cafe culture.",
    bio: "Pencerita ulung yang membongkar realita pacaran dan obrolan tongkrongan Timika.",
    phone: "+6281234567892",
    totalOpenMic: 31,
    isActive: true,
  },
  {
    id: "com-03",
    realName: "Rian Hidayat",
    stageName: "RIAN",
    comedyStyle: "Dark Comedy",
    punchline: "No one is safe. If you sit in the front row, you're part of the set.",
    bio: "Raja roast battle Timika dengan punchline tajam yang menguji mental penonton.",
    phone: "+6281234567893",
    totalOpenMic: 42,
    isActive: true,
  },
  {
    id: "com-04",
    realName: "Yosua Wenda",
    stageName: "YOSUA",
    comedyStyle: "Absurd",
    punchline: "Logika terbalik dan premis tak terduga yang bikin mikir dua kali.",
    bio: "Eksplorasi humor surealis dan analogi absurd yang membengkokkan akal sehat.",
    phone: "+6281234567894",
    totalOpenMic: 18,
    isActive: true,
  },
  {
    id: "com-05",
    realName: "Budi Kurniawan",
    stageName: "BUDI K.",
    comedyStyle: "Observational",
    punchline: "Menertawakan birokrasi dan harga tiket pesawat pedalaman Papua.",
    bio: "Spesialis komedi keresahan harian, harga sembako, dan sinyal di Mimika.",
    phone: "+6281234567895",
    totalOpenMic: 29,
    isActive: false,
  },
];

export const initialRegistrations: OpenMicRegistration[] = [
  {
    id: "reg-01",
    eventId: "evt-01",
    eventTitle: "THE GRIND VOL. 42",
    comedianName: "Fajar Nugraha (New Comer)",
    phone: "+6285211223344",
    notes: "Set 5 menit materi anak kosan SP2",
    status: "PENDING",
    submittedAt: "2026-10-09 14:30 WIT",
  },
  {
    id: "reg-02",
    eventId: "evt-01",
    eventTitle: "THE GRIND VOL. 42",
    comedianName: "Oka Pratama",
    phone: "+6281399887766",
    notes: "Materi observasi antrean SPBU Timika",
    status: "PENDING",
    submittedAt: "2026-10-09 16:15 WIT",
  },
  {
    id: "reg-03",
    eventId: "evt-02",
    eventTitle: "THE GRIND: NEWBLOOD",
    comedianName: "Andi Saputra",
    phone: "+6282144556677",
    notes: "Pengalaman pertama naik panggung standup",
    status: "APPROVED",
    submittedAt: "2026-10-08 11:00 WIT",
  },
];

export const initialMediaAssets: MediaAsset[] = [
  {
    id: "med-01",
    name: "hero-stage-dark.png",
    type: "BANNER",
    size: "1.4 MB",
    url: "/media/hero-stage-dark.png",
    uploadedAt: "2026-10-01",
  },
  {
    id: "med-02",
    name: "flyer-grind-vol42.jpg",
    type: "FLYER",
    size: "820 KB",
    url: "/media/flyer-grind-vol42.jpg",
    uploadedAt: "2026-10-05",
  },
  {
    id: "med-03",
    name: "dimas-headshot-bw.png",
    type: "HEADSHOT",
    size: "450 KB",
    url: "/media/dimas-headshot.png",
    uploadedAt: "2026-09-28",
  },
  {
    id: "med-04",
    name: "sky-coffee25-basecamp.jpg",
    type: "DOCUMENTATION",
    size: "2.1 MB",
    url: "/media/sky-coffee25.jpg",
    uploadedAt: "2026-10-02",
  },
];

export const monthlyActivityMetrics: ActivityMetric[] = [
  { month: "Mei", shows: 4, performers: 18, audience: 210 },
  { month: "Jun", shows: 5, performers: 22, audience: 280 },
  { month: "Jul", shows: 4, performers: 20, audience: 240 },
  { month: "Agu", shows: 6, performers: 28, audience: 360 },
  { month: "Sep", shows: 5, performers: 25, audience: 310 },
  { month: "Okt", shows: 7, performers: 32, audience: 420 },
];

/**
 * Storage Upload Abstraction
 * Easy migration point to Supabase Storage Client (`supabase.storage.from('bucket').upload(...)`)
 */
export async function uploadAsset(
  file: File | { name: string; size: number }
): Promise<{ url: string; path: string }> {
  // Mock upload delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  const mockPath = `uploads/${Date.now()}-${file.name}`;
  return {
    url: `https://mock-storage.supabase.co/storage/v1/object/public/stup-timika/${mockPath}`,
    path: mockPath,
  };
}
