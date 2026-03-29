'use strict';

/**
 * Natural language date parser
 * Handles: "3rd March 2025", "March 3rd, 2025", "3 March 2025",
 * "March 3 2025", "3/3/2025", "03-03-2025", ISO, etc.
 */

const MONTHS = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

const DAYS_OF_WEEK = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

function stripOrdinal(s) {
  return s.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
}

function makeDate(year, month, day) {
  // Validate ranges
  if (month < 0 || month > 11) return null;
  if (day < 1 || day > 31) return null;
  const d = new Date(year, month, day);
  if (d.getMonth() !== month) return null; // e.g. Feb 30
  return d;
}

function inferYear(year2digit) {
  const y = parseInt(year2digit);
  if (y <= 30) return 2000 + y;
  return 1900 + y;
}

function resolveWeekday(targetDay, now, direction = 'next') {
  const d = new Date(now);
  const currentDay = d.getDay();
  let diff = targetDay - currentDay;
  if (direction === 'next') {
    if (diff <= 0) diff += 7;
  } else if (direction === 'last') {
    if (diff >= 0) diff -= 7;
  } else {
    // nearest
    if (diff < -3) diff += 7;
    if (diff > 3) diff -= 7;
  }
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseNatural(input, now = new Date()) {
  if (!input || typeof input !== 'string') return null;
  let s = input.trim();

  // --- ISO 8601 fast-path ---
  // Full ISO: 2025-03-15T10:30:00.000Z
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d)) return d;
  }

  // --- Unix timestamp (ms) ---
  if (/^\d{13}$/.test(s)) {
    return new Date(parseInt(s));
  }

  // --- Unix timestamp (s) ---
  if (/^\d{10}$/.test(s)) {
    return new Date(parseInt(s) * 1000);
  }

  const lower = s.toLowerCase();

  // --- Day-of-week: "next friday", "last monday", "this wednesday" ---
  const dowNextMatch = lower.match(/^(next|last|this|coming)\s+(sunday|sun|monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thur|thurs|friday|fri|saturday|sat)$/);
  if (dowNextMatch) {
    const dir = dowNextMatch[1] === 'last' ? 'last' : 'next';
    const day = DAYS_OF_WEEK[dowNextMatch[2]];
    if (day !== undefined) return resolveWeekday(day, now, dir);
  }

  // bare weekday: "friday" → upcoming friday
  if (DAYS_OF_WEEK[lower] !== undefined) {
    return resolveWeekday(DAYS_OF_WEEK[lower], now, 'next');
  }

  // Strip ordinals for further parsing
  const clean = stripOrdinal(s);

  // --- DD/MM/YYYY or MM/DD/YYYY (ambiguous — prefer DD/MM for non-US) ---
  // But if month > 12, it must be DD/MM
  const slashFull = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (slashFull) {
    let [, a, b, y] = slashFull;
    a = parseInt(a); b = parseInt(b);
    const year = y.length === 2 ? inferYear(y) : parseInt(y);
    // If a > 12, must be DD/MM
    if (a > 12) return makeDate(year, b - 1, a);
    // If b > 12, must be MM/DD
    if (b > 12) return makeDate(year, a - 1, b);
    // Default: DD/MM/YYYY
    return makeDate(year, b - 1, a);
  }

  // --- YYYY/MM/DD ---
  const ymdSlash = clean.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdSlash) {
    const [, y, m, d] = ymdSlash;
    return makeDate(parseInt(y), parseInt(m) - 1, parseInt(d));
  }

  // --- "3 March 2025" / "3 March" ---
  const dmyText = clean.match(/^(\d{1,2})\s+([a-zA-Z]+)\s*(\d{4})?$/);
  if (dmyText) {
    const day = parseInt(dmyText[1]);
    const month = MONTHS[dmyText[2].toLowerCase()];
    const year = dmyText[3] ? parseInt(dmyText[3]) : now.getFullYear();
    if (month !== undefined) return makeDate(year, month, day);
  }

  // --- "March 3 2025" / "March 3rd, 2025" / "March 2025" ---
  const mdyText = clean.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s*(\d{4})?$/);
  if (mdyText) {
    const month = MONTHS[mdyText[1].toLowerCase()];
    const day = parseInt(mdyText[2]);
    const year = mdyText[3] ? parseInt(mdyText[3]) : now.getFullYear();
    if (month !== undefined) return makeDate(year, month, day);
  }

  // --- "March 2025" (no day → 1st) ---
  const myText = clean.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (myText) {
    const month = MONTHS[myText[1].toLowerCase()];
    const year = parseInt(myText[2]);
    if (month !== undefined) return makeDate(year, month, 1);
  }

  // --- "DD MMM YY" e.g. "15 Jan 25" ---
  const dmyShort = clean.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{2})$/);
  if (dmyShort) {
    const day = parseInt(dmyShort[1]);
    const month = MONTHS[dmyShort[2].toLowerCase()];
    const year = inferYear(dmyShort[3]);
    if (month !== undefined) return makeDate(year, month, day);
  }

  // --- Time strings with date: "2025-03-15 10:30" ---
  const dateTimeMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (dateTimeMatch) {
    const [, yr, mo, dy, hr, min, sec] = dateTimeMatch;
    return new Date(parseInt(yr), parseInt(mo) - 1, parseInt(dy), parseInt(hr), parseInt(min), parseInt(sec || 0));
  }

  // --- "15th of March 2025" ---
  const ofMatch = clean.match(/^(\d{1,2})\s+of\s+([a-zA-Z]+)\s*(\d{4})?$/i);
  if (ofMatch) {
    const day = parseInt(ofMatch[1]);
    const month = MONTHS[ofMatch[2].toLowerCase()];
    const year = ofMatch[3] ? parseInt(ofMatch[3]) : now.getFullYear();
    if (month !== undefined) return makeDate(year, month, day);
  }

  // --- Fallback: let native Date try ---
  const fallback = new Date(s);
  if (!isNaN(fallback.getTime())) return fallback;

  return null;
}

module.exports = { parseNatural, MONTHS, DAYS_OF_WEEK, stripOrdinal };
