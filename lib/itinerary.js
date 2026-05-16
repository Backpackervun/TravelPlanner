/**
 * Group itinerary rows into day-blocks based on the date alone.
 *
 * Returns an array of:
 *   { day, date, city, items: [...rows] }
 *
 * - Rows are grouped by date (consecutive rows sharing the same date
 *   form one group; an empty-date row starts/extends an "unknown" group).
 * - The day number is read from the optional `dayMap` (date → number),
 *   which is computed once at page level: chronological order of unique
 *   dates → 1..N. This makes Day a fully derived field.
 * - "city" tries to use the most-common city among the day's stops, so
 *   the day header reads naturally even if individual rows differ.
 * - Order is preserved.
 */
export function groupByDay(rows, dayMap = null) {
  if (!rows || rows.length === 0) return [];

  const groups = [];
  let current = null;

  for (const row of rows) {
    const date = row.date ?? "";
    if (!current || current.date !== date) {
      current = {
        day: dayMap ? dayMap[date] ?? null : null,
        date,
        city: row.city ?? "",
        cities: [],   // ✅ all unique cities in order of first appearance
        items: [],
      };
      groups.push(current);
    }
    current.items.push(row);
  }

  // Build ordered unique cities per day (preserve first-seen order)
  for (const g of groups) {
    const seen = new Set();
    const ordered = [];
    for (const it of g.items) {
      const c = (it.city || "").trim();
      if (c && !seen.has(c)) { seen.add(c); ordered.push(c); }
    }
    g.cities = ordered;
    // g.city = primary city (first seen, for backwards compat)
    g.city = ordered[0] ?? "";
  }

  return groups;
}

/**
 * Format an ISO date as "Sat, 5 Apr 2025".
 * Returns the input unchanged if it can't be parsed.
 */
export function formatDayLabel(iso) {
  if (!iso) return "";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Format an HH:MM time as "9:30 AM" for human readability in the print doc.
 * Returns the input unchanged if not parseable.
 */
export function formatTimeLabel(hhmm) {
  if (!hhmm || typeof hhmm !== "string") return "";
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return hhmm;
  const h = parseInt(m[1], 10);
  const min = m[2];
  if (h === 0) return `12:${min} AM`;
  if (h < 12) return `${h}:${min} AM`;
  if (h === 12) return `12:${min} PM`;
  return `${h - 12}:${min} PM`;
}
