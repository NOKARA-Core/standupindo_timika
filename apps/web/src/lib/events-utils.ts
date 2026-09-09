export function isValidTapTapLink(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === "-" ||
    trimmed === "#" ||
    trimmed.toLowerCase() === "none" ||
    trimmed.toLowerCase() === "null"
  ) {
    return false;
  }
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

export function formatEventDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  if (dateStr.includes(",")) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const day = days[d.getDay()];
    const month = months[d.getMonth()];
    const dateNum = d.getDate();
    const year = d.getFullYear();
    return `${day}, ${month} ${dateNum < 10 ? "0" + dateNum : dateNum}, ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Checks whether an event has passed compared to the current time in WIT (Papua / UTC+9)
 */
export function isEventPassed(dateStr: string, timeStr?: string): boolean {
  if (!dateStr) return false;
  try {
    const nowWIT = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jayapura",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (dateStr < nowWIT) return true;
    if (dateStr > nowWIT) return false;

    if (timeStr) {
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch && timeMatch[1] && timeMatch[2]) {
        const eventHours = parseInt(timeMatch[1], 10);
        const eventMinutes = parseInt(timeMatch[2], 10);
        const nowWITTime = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Jayapura",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());
        const parts = nowWITTime.split(":").map(Number);
        const nowH = parts[0] ?? 0;
        const nowM = parts[1] ?? 0;
        if (nowH > eventHours || (nowH === eventHours && nowM >= eventMinutes)) {
          return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

export type EventStatusType =
  | "CLOSED"
  | "EXPIRED"
  | "ACTIVE_WITH_TICKET"
  | "ACTIVE_NO_TICKET";

/**
 * Priority Hierarchy:
 * 1. STATUS MANUAL (CLOSED / COMPLETED)
 * 2. STATUS WAKTU OTOMATIS (EXPIRED in WIT)
 * 3. STATUS AKTIF DENGAN TIKET
 * 4. STATUS AKTIF TANPA TIKET (COMING SOON)
 */
export function getEventDisplayStatus(
  status?: string | null,
  dateStr?: string | null,
  timeStr?: string | null,
  ticketUrl?: string | null
): EventStatusType {
  const s = (status || "").toLowerCase().trim();

  // 1. STATUS MANUAL (CLOSED / COMPLETED)
  if (s === "closed" || s === "completed") {
    return "CLOSED";
  }

  // 2. STATUS WAKTU OTOMATIS (EXPIRED)
  if (dateStr && isEventPassed(dateStr, timeStr || undefined)) {
    return "EXPIRED";
  }

  // 3. STATUS AKTIF DENGAN TIKET
  if (isValidTapTapLink(ticketUrl)) {
    return "ACTIVE_WITH_TICKET";
  }

  // 4. STATUS AKTIF TANPA TIKET
  return "ACTIVE_NO_TICKET";
}

