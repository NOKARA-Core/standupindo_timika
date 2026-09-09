import { z } from "zod";

/**
 * Validates and sanitizes outbound external URLs (TapTap, WhatsApp, Medsos, Maps, etc.)
 * Strictly allows only https:// and mailto: (plus http:// on localhost/dev).
 * Explicitly rejects javascript:, data:, vbscript:, and relative or malformed protocols.
 */
export function sanitizeOutboundUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#" || trimmed === "-") return null;

  // Reject dangerous pseudo-protocols explicitly
  if (/^(javascript|vbscript|data|file):/i.test(trimmed)) {
    return null;
  }

  // Handle mailto: protocols
  if (/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(trimmed)) {
    return trimmed;
  }

  // Handle http/https protocols
  try {
    const parsed = new URL(trimmed);
    const isDev = process.env.NODE_ENV === "development";
    if (parsed.protocol === "https:" || (isDev && parsed.protocol === "http:")) {
      return parsed.href;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Sanitizes search input and public text inputs.
 * Strips dangerous control characters, null bytes, and enforces maximum length.
 */
export function sanitizeSearchInput(input?: string | null, maxLength = 100): string {
  if (!input) return "";
  // Strip null bytes and control characters except basic spaces
  const clean = input.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  return clean.slice(0, maxLength).trim();
}

/**
 * Zod Schema for Login Request Authentication
 */
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username atau email wajib diisi.")
    .max(255, "Username terlalu panjang (maksimal 255 karakter)."),
  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .max(255, "Password terlalu panjang (maksimal 255 karakter)."),
});

export type LoginInput = z.infer<typeof loginSchema>;
