'use strict';

/**
 * Timezone-aware utilities for flexdate
 * Converts a parsed local Date to a specific timezone offset or IANA tz name.
 */

const COMMON_OFFSETS = {
  utc: 0,
  gmt: 0,
  est: -5 * 60,
  edt: -4 * 60,
  cst: -6 * 60,
  cdt: -5 * 60,
  mst: -7 * 60,
  mdt: -6 * 60,
  pst: -8 * 60,
  pdt: -7 * 60,
  ist: 5 * 60 + 30,
  jst: 9 * 60,
  cet: 1 * 60,
  cest: 2 * 60,
  aest: 10 * 60,
  nzst: 12 * 60,
};

/**
 * Parse timezone abbreviation or offset string into minutes
 * e.g. "UTC", "+05:30", "-08:00", "PST"
 */
function parseTzOffset(tz) {
  if (!tz) return null;
  const lower = tz.toLowerCase().trim();
  if (COMMON_OFFSETS[lower] !== undefined) return COMMON_OFFSETS[lower];

  // "+05:30" or "-08:00" or "+0530"
  const offsetMatch = tz.match(/^([+-])(\d{2}):?(\d{2})$/);
  if (offsetMatch) {
    const sign = offsetMatch[1] === '+' ? 1 : -1;
    const hours = parseInt(offsetMatch[2]);
    const mins = parseInt(offsetMatch[3]);
    return sign * (hours * 60 + mins);
  }

  return null;
}

/**
 * Convert a Date to a different timezone, returning a new Date whose
 * local time represents the time in the target timezone.
 */
function toTimezone(date, tz) {
  if (!date || isNaN(date.getTime())) return date;

  // Try IANA timezone via Intl (available in Node.js 13+ and all modern browsers)
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const get = (type) => parts.find(p => p.type === type)?.value;
    const yr = parseInt(get('year'));
    const mo = parseInt(get('month')) - 1;
    const dy = parseInt(get('day'));
    const hr = parseInt(get('hour'));
    const mn = parseInt(get('minute'));
    const sc = parseInt(get('second'));
    return new Date(yr, mo, dy, hr === 24 ? 0 : hr, mn, sc);
  } catch (_) {
    // Fall back to offset-based
  }

  const offsetMins = parseTzOffset(tz);
  if (offsetMins !== null) {
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utcMs + offsetMins * 60000);
  }

  return date;
}

module.exports = { parseTzOffset, toTimezone, COMMON_OFFSETS };
