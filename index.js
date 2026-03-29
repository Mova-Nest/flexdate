'use strict';

/**
 * flexdate — Parse any date string, just works.
 *
 * @example
 * const flexDate = require('flexdate');
 * flexDate('3rd March 2025')   // → Date
 * flexDate('yesterday')        // → Date
 * flexDate('in 3 days')        // → Date
 * flexDate('2025-03-15')       // → Date
 * flexDate('next friday')      // → Date
 * flexDate('March 15 at 3pm')  // → Date
 */

const { parseRelative } = require('./lib/relative');
const { parseNatural } = require('./lib/natural');
const { parseTime, extractTimeFromString } = require('./lib/time');
const { toTimezone } = require('./lib/timezone');
const { format, humanize } = require('./lib/format');

/**
 * @typedef {Object} flexDateOptions
 * @property {Date}   [now]       - Reference "now" for relative parsing (default: new Date())
 * @property {string} [timezone]  - IANA timezone or offset string to convert result into
 * @property {boolean} [strict]   - If true, throw on unparseable input instead of returning null
 */

/**
 * Parse any date string into a JS Date object.
 *
 * @param {string|number|Date} input
 * @param {flexDateOptions}     [options]
 * @returns {Date|null}
 */
function flexDate(input, options = {}) {
  // Already a Date
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? _fail(input, options) : input;
  }

  // Number → treat as unix ms
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? _fail(input, options) : d;
  }

  if (typeof input !== 'string' || !input.trim()) {
    return _fail(input, options);
  }

  const now = options.now instanceof Date ? options.now : new Date();
  let result = null;

  // 1. Try to extract a time component ("at 3pm", trailing time)
  const { datePart, timePart } = extractTimeFromString(input.trim());

  // 2. Try relative parser on the date part
  result = parseRelative(datePart.trim(), now);

  // 3. Try natural language / structured parser
  if (!result) {
    result = parseNatural(datePart.trim(), now);
  }

  // 4. If we got a date and there's a time part, apply it
  if (result && timePart) {
    const withTime = parseTime(timePart, result);
    if (withTime) result = withTime;
  }

  // 5. If only a time string was provided (no date part or date part was empty/whitespace)
  if (!result && !datePart.trim() && timePart) {
    result = parseTime(timePart, now);
  }

  // 6. Apply timezone if specified
  if (result && options.timezone) {
    result = toTimezone(result, options.timezone);
  }

  if (!result) return _fail(input, options);
  return result;
}

function _fail(input, options) {
  if (options.strict) {
    throw new Error(`[flexdate] Unable to parse: "${input}"`);
  }
  return null;
}

// ─── Convenience Helpers ────────────────────────────────────────────────────

/**
 * Parse or throw. Same as flexDate(input, { strict: true }).
 */
flexDate.parse = function (input, options = {}) {
  return flexDate(input, { ...options, strict: true });
};

/**
 * Try to parse; returns null on failure (never throws).
 */
flexDate.try = function (input, options = {}) {
  return flexDate(input, { ...options, strict: false });
};

/**
 * Returns true if the input can be parsed.
 */
flexDate.isValid = function (input, options = {}) {
  return flexDate(input, { ...options, strict: false }) !== null;
};

/**
 * Format a parsed date using format tokens.
 * flexDate.format('3rd March 2025', 'MMMM Do, YYYY') → 'March 3rd, 2025'
 */
flexDate.format = function (input, fmt, options = {}) {
  const d = flexDate(input, options);
  if (!d) return null;
  return format(d, fmt);
};

/**
 * Humanize a date relative to now (or a reference date).
 * flexDate.humanize('yesterday') → '1 day ago'
 */
flexDate.humanize = function (input, options = {}) {
  const d = flexDate(input, options);
  if (!d) return null;
  return humanize(d, options.now || new Date());
};

/**
 * Convert a date string to a different timezone.
 * flexDate.tz('2025-03-15', 'America/New_York')
 */
flexDate.tz = function (input, timezone, options = {}) {
  return flexDate(input, { ...options, timezone });
};

/**
 * Get the difference between two date strings in milliseconds (or a unit).
 * flexDate.diff('tomorrow', 'yesterday', 'days') → 2
 */
flexDate.diff = function (a, b, unit = 'ms', options = {}) {
  const da = flexDate(a, options);
  const db = flexDate(b, options);
  if (!da || !db) return null;

  const ms = da.getTime() - db.getTime();

  const divisors = {
    ms: 1,
    milliseconds: 1,
    s: 1000,
    seconds: 1000,
    m: 60000,
    minutes: 60000,
    h: 3600000,
    hours: 3600000,
    d: 86400000,
    days: 86400000,
    w: 7 * 86400000,
    weeks: 7 * 86400000,
  };

  const div = divisors[unit] || 1;
  return ms / div;
};

/**
 * Add a duration to a parsed date.
 * flexDate.add('today', 3, 'days')
 */
flexDate.add = function (input, amount, unit, options = {}) {
  const d = flexDate(input, options);
  if (!d) return null;

  const ms = _unitToMs(unit);
  if (ms === null) return null;
  return new Date(d.getTime() + amount * ms);
};

/**
 * Subtract a duration from a parsed date.
 */
flexDate.subtract = function (input, amount, unit, options = {}) {
  return flexDate.add(input, -amount, unit, options);
};

/**
 * Check if date a is before date b.
 */
flexDate.isBefore = function (a, b, options = {}) {
  const da = flexDate(a, options);
  const db = flexDate(b, options);
  if (!da || !db) return null;
  return da.getTime() < db.getTime();
};

/**
 * Check if date a is after date b.
 */
flexDate.isAfter = function (a, b, options = {}) {
  const da = flexDate(a, options);
  const db = flexDate(b, options);
  if (!da || !db) return null;
  return da.getTime() > db.getTime();
};

/**
 * Check if two dates are on the same calendar day.
 */
flexDate.isSameDay = function (a, b, options = {}) {
  const da = flexDate(a, options);
  const db = flexDate(b, options);
  if (!da || !db) return null;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

/**
 * Start of a unit for a given date.
 * flexDate.startOf('today', 'month') → first day of current month
 */
flexDate.startOf = function (input, unit, options = {}) {
  const d = flexDate(input, options);
  if (!d) return null;
  const result = new Date(d);

  switch (unit) {
    case 'second':
      result.setMilliseconds(0);
      break;
    case 'minute':
      result.setSeconds(0, 0);
      break;
    case 'hour':
      result.setMinutes(0, 0, 0);
      break;
    case 'day':
      result.setHours(0, 0, 0, 0);
      break;
    case 'week':
      result.setDate(result.getDate() - result.getDay());
      result.setHours(0, 0, 0, 0);
      break;
    case 'month':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'year':
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
  }
  return result;
};

/**
 * End of a unit for a given date.
 */
flexDate.endOf = function (input, unit, options = {}) {
  const d = flexDate(input, options);
  if (!d) return null;
  const result = new Date(d);

  switch (unit) {
    case 'second':
      result.setMilliseconds(999);
      break;
    case 'minute':
      result.setSeconds(59, 999);
      break;
    case 'hour':
      result.setMinutes(59, 59, 999);
      break;
    case 'day':
      result.setHours(23, 59, 59, 999);
      break;
    case 'week':
      result.setDate(result.getDate() + (6 - result.getDay()));
      result.setHours(23, 59, 59, 999);
      break;
    case 'month':
      result.setMonth(result.getMonth() + 1, 0);
      result.setHours(23, 59, 59, 999);
      break;
    case 'year':
      result.setMonth(11, 31);
      result.setHours(23, 59, 59, 999);
      break;
  }
  return result;
};

// ─── Locale Support ──────────────────────────────────────────────────────────

const { registerLocale, parseLocale, listLocales } = require('./lib/locale');

/**
 * Parse a date string using a specific locale.
 * flexDate.locale('15 mars 2025', 'fr') → Date
 */
flexDate.locale = function (input, locale, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const result = parseLocale(input, locale, now);
  if (result && options.timezone) {
    return require('./lib/timezone').toTimezone(result, options.timezone);
  }
  return result;
};

flexDate.registerLocale = registerLocale;
flexDate.listLocales = listLocales;

// ─── Range & Batch ───────────────────────────────────────────────────────────

const rangeUtils = require('./lib/range');

flexDate.range    = rangeUtils.range;
flexDate.batch    = rangeUtils.batch;
flexDate.sort     = rangeUtils.sort;
flexDate.earliest = rangeUtils.earliest;
flexDate.latest   = rangeUtils.latest;
flexDate.inRange  = rangeUtils.inRange;

// ─── ESM-compatible default export ───────────────────────────────────────────
flexDate.default = flexDate;

function _unitToMs(unit) {
  const map = {
    ms: 1, milliseconds: 1, millisecond: 1,
    s: 1000, seconds: 1000, second: 1000,
    m: 60000, minutes: 60000, minute: 60000,
    h: 3600000, hours: 3600000, hour: 3600000,
    d: 86400000, days: 86400000, day: 86400000,
    w: 7 * 86400000, weeks: 7 * 86400000, week: 7 * 86400000,
  };
  return map[unit] ?? null;
}

module.exports = flexDate;
