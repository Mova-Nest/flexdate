'use strict';

/**
 * Range and batch utilities for flexdate
 * flexDate is injected to avoid circular deps.
 */

let flexDate;
function _getflexDate() {
  if (!flexDate) flexDate = require('../index.js');
  return flexDate;
}

/**
 * Generate an array of Dates between start and end (inclusive), stepping by unit.
 *
 * @param {string|Date} start
 * @param {string|Date} end
 * @param {'day'|'week'|'month'|'hour'|'minute'} step
 * @param {import('../index').flexDateOptions} [options]
 * @returns {Date[]}
 */
function range(start, end, step = 'day', options = {}) {
  const startDate = _getflexDate()(start, options);
  const endDate = _getflexDate()(end, options);
  if (!startDate || !endDate) return [];

  const stepMs = {
    minute: 60000,
    hour: 3600000,
    day: 86400000,
    week: 7 * 86400000,
  }[step];

  if (stepMs) {
    const result = [];
    let current = startDate.getTime();
    const endMs = endDate.getTime();
    while (current <= endMs) {
      result.push(new Date(current));
      current += stepMs;
    }
    return result;
  }

  // Month stepping (variable-length)
  if (step === 'month') {
    const result = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      result.push(new Date(d));
      d.setMonth(d.getMonth() + 1);
    }
    return result;
  }

  if (step === 'year') {
    const result = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      result.push(new Date(d));
      d.setFullYear(d.getFullYear() + 1);
    }
    return result;
  }

  return [];
}

/**
 * Parse an array of date strings, returning an array of Date|null.
 *
 * @param {Array<string|number|Date>} inputs
 * @param {import('../index').flexDateOptions} [options]
 * @returns {Array<Date|null>}
 */
function batch(inputs, options = {}) {
  if (!Array.isArray(inputs)) return [];
  return inputs.map(input => _getflexDate()(input, options));
}

/**
 * Parse and sort an array of date strings.
 *
 * @param {Array<string|number|Date>} inputs
 * @param {'asc'|'desc'} [order]
 * @param {import('../index').flexDateOptions} [options]
 * @returns {Date[]}
 */
function sort(inputs, order = 'asc', options = {}) {
  const parsed = batch(inputs, options).filter(Boolean);
  parsed.sort((a, b) => order === 'asc' ? a - b : b - a);
  return parsed;
}

/**
 * Returns the earliest date from a list of strings.
 */
function earliest(inputs, options = {}) {
  const dates = batch(inputs, options).filter(Boolean);
  if (!dates.length) return null;
  return dates.reduce((min, d) => d < min ? d : min);
}

/**
 * Returns the latest date from a list of strings.
 */
function latest(inputs, options = {}) {
  const dates = batch(inputs, options).filter(Boolean);
  if (!dates.length) return null;
  return dates.reduce((max, d) => d > max ? d : max);
}

/**
 * Check if a date falls within a range (inclusive).
 *
 * @param {string|Date} date
 * @param {string|Date} start
 * @param {string|Date} end
 * @param {import('../index').flexDateOptions} [options]
 * @returns {boolean|null}
 */
function inRange(date, start, end, options = {}) {
  const d = _getflexDate()(date, options);
  const s = _getflexDate()(start, options);
  const e = _getflexDate()(end, options);
  if (!d || !s || !e) return null;
  return d >= s && d <= e;
}

module.exports = { range, batch, sort, earliest, latest, inRange };
