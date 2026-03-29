'use strict';

/**
 * Formatting utilities for flexdate
 */

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const MONTH_ABBR = MONTH_NAMES.map(m => m.slice(0, 3));
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_ABBR = DAY_NAMES.map(d => d.slice(0, 3));

function pad(n, len = 2) {
  return String(n).padStart(len, '0');
}

function ordinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Format a Date using a token-based format string.
 *
 * Tokens:
 *   YYYY  → 4-digit year
 *   YY    → 2-digit year
 *   MMMM  → full month name
 *   MMM   → short month name
 *   MM    → 2-digit month
 *   M     → month (no pad)
 *   DD    → 2-digit day
 *   D     → day (no pad)
 *   Do    → day with ordinal (1st, 2nd...)
 *   dddd  → full weekday
 *   ddd   → short weekday
 *   HH    → 24h hours (padded)
 *   H     → 24h hours (no pad)
 *   hh    → 12h hours (padded)
 *   h     → 12h hours (no pad)
 *   mm    → minutes (padded)
 *   ss    → seconds (padded)
 *   A     → AM/PM
 *   a     → am/pm
 *   x     → unix ms
 *   X     → unix s
 */
function format(date, fmt) {
  if (!date || isNaN(date.getTime())) return '';
  if (!fmt) fmt = 'YYYY-MM-DD';

  const yr = date.getFullYear();
  const mo = date.getMonth();
  const dy = date.getDate();
  const wd = date.getDay();
  const hr = date.getHours();
  const mn = date.getMinutes();
  const sc = date.getSeconds();
  const h12 = hr % 12 || 12;

  const tokens = {
    YYYY: String(yr),
    YY: String(yr).slice(-2),
    MMMM: MONTH_NAMES[mo],
    MMM: MONTH_ABBR[mo],
    MM: pad(mo + 1),
    M: String(mo + 1),
    DD: pad(dy),
    D: String(dy),
    Do: dy + ordinalSuffix(dy),
    dddd: DAY_NAMES[wd],
    ddd: DAY_ABBR[wd],
    HH: pad(hr),
    H: String(hr),
    hh: pad(h12),
    h: String(h12),
    mm: pad(mn),
    ss: pad(sc),
    A: hr < 12 ? 'AM' : 'PM',
    a: hr < 12 ? 'am' : 'pm',
    x: String(date.getTime()),
    X: String(Math.floor(date.getTime() / 1000)),
  };

  // Replace tokens using a single regex pass to avoid partial substitutions
  // e.g. "MMMM" must not match "MM" + "MM"
  const tokenKeys = Object.keys(tokens).sort((a, b) => b.length - a.length);
  const escaped = tokenKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(escaped.join('|'), 'g');
  return fmt.replace(re, (match) => tokens[match] ?? match);
}

/**
 * Humanize: returns a friendly relative string from now
 * e.g. "3 days ago", "in 2 hours", "just now"
 */
function humanize(date, from = new Date()) {
  if (!date || isNaN(date.getTime())) return '';
  const diffMs = date.getTime() - from.getTime();
  const abs = Math.abs(diffMs);
  const future = diffMs > 0;

  const thresholds = [
    { limit: 45000, label: 'just now', skipDir: true },
    { limit: 90000, unit: 'a minute' },
    { limit: 45 * 60000, divisor: 60000, unit: 'minutes' },
    { limit: 90 * 60000, unit: 'an hour' },
    { limit: 22 * 3600000, divisor: 3600000, unit: 'hours' },
    { limit: 36 * 3600000, unit: 'a day' },
    { limit: 25 * 86400000, divisor: 86400000, unit: 'days' },
    { limit: 45 * 86400000, unit: 'a month' },
    { limit: 345 * 86400000, divisor: 30 * 86400000, unit: 'months' },
    { limit: 545 * 86400000, unit: 'a year' },
    { limit: Infinity, divisor: 365 * 86400000, unit: 'years' },
  ];

  for (const t of thresholds) {
    if (abs < t.limit) {
      if (t.skipDir) return t.label;
      const count = t.divisor ? Math.round(abs / t.divisor) : null;
      const label = count ? `${count} ${t.unit}` : t.unit;
      return future ? `in ${label}` : `${label} ago`;
    }
  }

  return format(date, 'MMMM D, YYYY');
}

module.exports = { format, humanize, ordinalSuffix, MONTH_NAMES, DAY_NAMES };
