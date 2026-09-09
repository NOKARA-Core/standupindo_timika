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
