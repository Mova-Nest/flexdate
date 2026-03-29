'use strict';

/**
 * Relative date parser
 * Handles: yesterday, today, tomorrow, last/next week/month/year,
 * "3 days ago", "in 2 weeks", "2 months ago", etc.
 */

const UNITS = {
  second: 1000,
  seconds: 1000,
  sec: 1000,
  secs: 1000,
  minute: 60 * 1000,
  minutes: 60 * 1000,
  min: 60 * 1000,
  mins: 60 * 1000,
  hour: 3600 * 1000,
  hours: 3600 * 1000,
  hr: 3600 * 1000,
  hrs: 3600 * 1000,
  day: 86400 * 1000,
  days: 86400 * 1000,
  week: 7 * 86400 * 1000,
  weeks: 7 * 86400 * 1000,
  wk: 7 * 86400 * 1000,
  wks: 7 * 86400 * 1000,
  month: 30 * 86400 * 1000,
  months: 30 * 86400 * 1000,
  mo: 30 * 86400 * 1000,
  year: 365 * 86400 * 1000,
  years: 365 * 86400 * 1000,
  yr: 365 * 86400 * 1000,
  yrs: 365 * 86400 * 1000,
};

const WORD_NUMBERS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, hundred: 100,
};

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseRelative(input, now = new Date()) {
  const s = input.trim().toLowerCase();

  // Absolute words
  if (s === 'now') return new Date(now);
  if (s === 'today') return startOfDay(now);
  if (s === 'yesterday') {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return startOfDay(d);
  }
  if (s === 'tomorrow') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return startOfDay(d);
  }
  if (s === 'the day after tomorrow') {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    return startOfDay(d);
  }
  if (s === 'the day before yesterday') {
    const d = new Date(now);
    d.setDate(d.getDate() - 2);
    return startOfDay(d);
  }

  // last/next week, month, year
  if (s === 'last week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return startOfDay(d);
  }
  if (s === 'next week') {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return startOfDay(d);
  }
  if (s === 'last month') {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return startOfDay(d);
  }
  if (s === 'next month') {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 1);
    return startOfDay(d);
  }
  if (s === 'last year') {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - 1);
    return startOfDay(d);
  }
  if (s === 'next year') {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 1);
    return startOfDay(d);
  }

  // "3 days ago" / "in 3 days" / "3 days from now"
  const agoMatch = s.match(/^(\d+|\w+)\s+(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours|hr|hrs|day|days|week|weeks|wk|wks|month|months|mo|year|years|yr|yrs)\s+ago$/);
  if (agoMatch) {
    const amount = parseInt(agoMatch[1]) || WORD_NUMBERS[agoMatch[1]] || 1;
    const unit = UNITS[agoMatch[2]];
    if (unit) return new Date(now.getTime() - amount * unit);
  }

  const inMatch = s.match(/^in\s+(\d+|\w+)\s+(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours|hr|hrs|day|days|week|weeks|wk|wks|month|months|mo|year|years|yr|yrs)$/);
  if (inMatch) {
    const amount = parseInt(inMatch[1]) || WORD_NUMBERS[inMatch[1]] || 1;
    const unit = UNITS[inMatch[2]];
    if (unit) return new Date(now.getTime() + amount * unit);
  }

  const fromNowMatch = s.match(/^(\d+|\w+)\s+(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours|hr|hrs|day|days|week|weeks|wk|wks|month|months|mo|year|years|yr|yrs)\s+from\s+now$/);
  if (fromNowMatch) {
    const amount = parseInt(fromNowMatch[1]) || WORD_NUMBERS[fromNowMatch[1]] || 1;
    const unit = UNITS[fromNowMatch[2]];
    if (unit) return new Date(now.getTime() + amount * unit);
  }

  // "a week ago", "an hour ago"
  const aWordAgoMatch = s.match(/^(a|an)\s+(second|minute|hour|day|week|month|year)\s+ago$/);
  if (aWordAgoMatch) {
    const unit = UNITS[aWordAgoMatch[2]];
    if (unit) return new Date(now.getTime() - unit);
  }

  return null;
}

module.exports = { parseRelative, startOfDay, endOfDay };
