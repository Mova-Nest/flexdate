'use strict';

const flexDate = require('../index.js');

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`  ✓  ${label}`);
    passed++;
  } catch (e) {
    console.log(`  ✗  ${label}`);
    console.log(`       ${e.message}`);
    failed++;
  }
}

function assert(val, msg) {
  if (!val) throw new Error(msg || 'Assertion failed');
}

function assertDate(result, { year, month, day } = {}, label = '') {
  assert(result instanceof Date, `${label}: expected Date, got ${result}`);
  assert(!isNaN(result.getTime()), `${label}: Date is NaN`);
  if (year !== undefined) assert(result.getFullYear() === year, `${label}: year ${result.getFullYear()} !== ${year}`);
  if (month !== undefined) assert(result.getMonth() === month - 1, `${label}: month ${result.getMonth() + 1} !== ${month}`);
  if (day !== undefined) assert(result.getDate() === day, `${label}: day ${result.getDate()} !== ${day}`);
}

// ─── Core Parsing ────────────────────────────────────────────────────────────
console.log('\n  Core Parsing');

test('ISO date string', () => {
  assertDate(flexDate('2025-03-15'), { year: 2025, month: 3, day: 15 });
});

test('ISO datetime string', () => {
  const d = flexDate('2025-03-15T10:30:00Z');
  assert(d instanceof Date);
});

test('Ordinal: 3rd March 2025', () => {
  assertDate(flexDate('3rd March 2025'), { year: 2025, month: 3, day: 3 });
});

test('Ordinal: 1st January 2020', () => {
  assertDate(flexDate('1st January 2020'), { year: 2020, month: 1, day: 1 });
});

test('Ordinal: 22nd February 2024', () => {
  assertDate(flexDate('22nd February 2024'), { year: 2024, month: 2, day: 22 });
});

test('Natural: March 3rd, 2025', () => {
  assertDate(flexDate('March 3rd, 2025'), { year: 2025, month: 3, day: 3 });
});

test('Natural: 3 March 2025', () => {
  assertDate(flexDate('3 March 2025'), { year: 2025, month: 3, day: 3 });
});

test('Natural: March 2025 (no day)', () => {
  assertDate(flexDate('March 2025'), { year: 2025, month: 3, day: 1 });
});

test('Slashes: 15/03/2025', () => {
  assertDate(flexDate('15/03/2025'), { year: 2025, month: 3, day: 15 });
});

test('Dashes: 15-03-2025', () => {
  assertDate(flexDate('15-03-2025'), { year: 2025, month: 3, day: 15 });
});

test('YYYY/MM/DD: 2025/03/15', () => {
  assertDate(flexDate('2025/03/15'), { year: 2025, month: 3, day: 15 });
});

test('Short month: 15 Jan 25', () => {
  assertDate(flexDate('15 Jan 25'), { year: 2025, month: 1, day: 15 });
});

test('15th of March 2025', () => {
  assertDate(flexDate('15th of March 2025'), { year: 2025, month: 3, day: 15 });
});

test('Unix ms timestamp', () => {
  const d = flexDate(1741996800000);
  assert(d instanceof Date);
});

test('Date passthrough', () => {
  const now = new Date();
  assert(flexDate(now) === now);
});

// ─── Relative Dates ──────────────────────────────────────────────────────────
console.log('\n  Relative Dates');

const REF = new Date('2025-06-15T12:00:00');

test('today', () => {
  const d = flexDate('today', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 15 });
});

test('yesterday', () => {
  const d = flexDate('yesterday', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 14 });
});

test('tomorrow', () => {
  const d = flexDate('tomorrow', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 16 });
});

test('the day after tomorrow', () => {
  const d = flexDate('the day after tomorrow', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 17 });
});

test('3 days ago', () => {
  const d = flexDate('3 days ago', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 12 });
});

test('in 5 days', () => {
  const d = flexDate('in 5 days', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 20 });
});

test('7 days from now', () => {
  const d = flexDate('7 days from now', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 22 });
});

test('2 weeks ago', () => {
  const d = flexDate('2 weeks ago', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 1 });
});

test('last week', () => {
  const d = flexDate('last week', { now: REF });
  assert(d instanceof Date);
});

test('next month', () => {
  const d = flexDate('next month', { now: REF });
  assertDate(d, { year: 2025, month: 7 });
});

test('a week ago', () => {
  const d = flexDate('a week ago', { now: REF });
  assert(d instanceof Date);
});

// ─── Weekdays ─────────────────────────────────────────────────────────────────
console.log('\n  Weekday Parsing');

test('next friday', () => {
  const d = flexDate('next friday', { now: REF }); // REF = Sunday June 15
  assert(d instanceof Date);
  assert(d.getDay() === 5);
});

test('last monday', () => {
  const d = flexDate('last monday', { now: REF });
  assert(d instanceof Date);
  assert(d.getDay() === 1);
});

test('bare: friday', () => {
  const d = flexDate('friday', { now: REF });
  assert(d instanceof Date);
  assert(d.getDay() === 5);
});

// ─── Time Parsing ─────────────────────────────────────────────────────────────
console.log('\n  Time Parsing');

test('March 15 at 3pm', () => {
  const d = flexDate('March 15 at 3pm', { now: REF });
  assertDate(d, { month: 3, day: 15 });
  assert(d.getHours() === 15);
});

test('tomorrow at noon', () => {
  const d = flexDate('tomorrow at noon', { now: REF });
  assert(d.getHours() === 12);
});

test('yesterday at 3:30pm', () => {
  const d = flexDate('yesterday at 3:30pm', { now: REF });
  assert(d.getHours() === 15);
  assert(d.getMinutes() === 30);
});

test('2025-03-15 at midnight', () => {
  const d = flexDate('2025-03-15 at midnight');
  assert(d.getHours() === 0);
});

// ─── Utility Methods ─────────────────────────────────────────────────────────
console.log('\n  Utility Methods');

test('flexDate.isValid valid', () => {
  assert(flexDate.isValid('3rd March 2025') === true);
});

test('flexDate.isValid invalid', () => {
  assert(flexDate.isValid('not a date at all xyz') === false);
});

test('flexDate.format', () => {
  const result = flexDate.format('3rd March 2025', 'MMMM Do, YYYY');
  assert(result === 'March 3rd, 2025', `Got: ${result}`);
});

test('flexDate.format YYYY-MM-DD', () => {
  const result = flexDate.format('3rd March 2025', 'YYYY-MM-DD');
  assert(result === '2025-03-03', `Got: ${result}`);
});

test('flexDate.humanize', () => {
  const result = flexDate.humanize('yesterday', { now: REF });
  assert(typeof result === 'string' && result.includes('day'));
});

test('flexDate.diff days', () => {
  const d = flexDate.diff('2025-06-17', '2025-06-15', 'days');
  assert(d === 2, `Expected 2, got ${d}`);
});

test('flexDate.add days', () => {
  const d = flexDate.add('2025-03-15', 5, 'days');
  assertDate(d, { year: 2025, month: 3, day: 20 });
});

test('flexDate.subtract days', () => {
  const d = flexDate.subtract('2025-03-15', 5, 'days');
  assertDate(d, { year: 2025, month: 3, day: 10 });
});

test('flexDate.isBefore', () => {
  assert(flexDate.isBefore('2025-03-01', '2025-03-15') === true);
});

test('flexDate.isAfter', () => {
  assert(flexDate.isAfter('2025-03-15', '2025-03-01') === true);
});

test('flexDate.isSameDay', () => {
  assert(flexDate.isSameDay('2025-03-15', 'March 15 2025') === true);
});

test('flexDate.startOf month', () => {
  const d = flexDate.startOf('2025-03-15', 'month');
  assertDate(d, { year: 2025, month: 3, day: 1 });
});

test('flexDate.endOf month', () => {
  const d = flexDate.endOf('2025-03-15', 'month');
  assertDate(d, { year: 2025, month: 3, day: 31 });
  assert(d.getHours() === 23);
});

test('flexDate.startOf year', () => {
  const d = flexDate.startOf('2025-06-15', 'year');
  assertDate(d, { year: 2025, month: 1, day: 1 });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
console.log('\n  Error Handling');

test('returns null for garbage', () => {
  const d = flexDate('zzz not a date');
  assert(d === null);
});

test('strict throws', () => {
  let threw = false;
  try { flexDate.parse('zzz not a date'); } catch (_) { threw = true; }
  assert(threw);
});

test('flexDate.try returns null', () => {
  assert(flexDate.try('garbage input') === null);
});

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
