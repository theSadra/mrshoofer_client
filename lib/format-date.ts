// Helper utilities for consistent Tehran-local (Asia/Tehran) date & time formatting
// Ensures we NEVER accidentally show UTC times when backend returns ISO strings with Z.

const TEHRAN_TZ = "Asia/Tehran";

/**
 * Safely create Date from various inputs.
 * @param {string|number|Date|null|undefined} value
 * @returns {Date|null}
 */
function toDate(value: string | number | Date | null | undefined): Date | null {
  if (!value) return null;
  try {
    const d = new Date(value);

    if (isNaN(d.getTime())) return null;

    return d;
  } catch {
    return null;
  }
}

/**
 * Format only time (HH:MM) in Persian locale locked to Tehran timezone.
 * @param {string|number|Date|null|undefined} value
 */
export function formatTehranTime(
  value: string | number | Date | null | undefined,
): string {
  const d = toDate(value);

  if (!d) return "—";

  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: TEHRAN_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format date (YYYY/MM/DD) Persian locale locked to Tehran timezone.
 * @param {string|number|Date|null|undefined} value
 */
export function formatTehranDate(
  value: string | number | Date | null | undefined,
): string {
  const d = toDate(value);

  if (!d) return "—";

  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: TEHRAN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Format weekday name in Persian locale locked to Tehran timezone.
 * @param {string|number|Date|null|undefined} value
 */
export function formatTehranWeekday(
  value: string | number | Date | null | undefined,
): string {
  const d = toDate(value);

  if (!d) return "—";

  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: TEHRAN_TZ,
    weekday: "long",
  }).format(d);
}

/**
 * Convenience combined format returning {time, date, weekday}
 * @param {string|number|Date|null|undefined} value
 */
export function formatTehranDateTime(
  value: string | number | Date | null | undefined,
): {
  time: string;
  date: string;
  weekday: string;
} {
  return {
    time: formatTehranTime(value),
    date: formatTehranDate(value),
    weekday: formatTehranWeekday(value),
  };
}

export default {
  formatTehranTime,
  formatTehranDate,
  formatTehranDateTime,
  formatTehranWeekday,
};
