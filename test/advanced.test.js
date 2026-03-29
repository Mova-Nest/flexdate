'use strict';

const flexDate = require('../index.js');

let passed = 0, failed = 0;
function test(label, fn) {
  try { fn(); console.log(`  ✓  ${label}`); passed++; }
  catch (e) { console.log(`  ✗  ${label}\n       ${e.message}`); failed++; }
}
function assert(val, msg) { if (!val) throw new Error(msg || 'Assertion failed'); }
function assertDate(d, { year, month, day } = {}, lbl = '') {
  assert(d instanceof Date && !isNaN(d), `${lbl}: not a valid Date (got ${d})`);
  if (year  !== undefined) assert(d.getFullYear()  === year,      `${lbl}: year ${d.getFullYear()} !== ${year}`);
  if (month !== undefined) assert(d.getMonth() + 1 === month,     `${lbl}: month ${d.getMonth()+1} !== ${month}`);
  if (day   !== undefined) assert(d.getDate()      === day,       `${lbl}: day ${d.getDate()} !== ${day}`);
}

const REF = new Date('2025-06-15T12:00:00');

// ─── Locale ───────────────────────────────────────────────────────────────────
console.log('\n  Locale Parsing');

test('fr: 15 mars 2025', () => {
  assertDate(flexDate.locale('15 mars 2025', 'fr'), { year: 2025, month: 3, day: 15 });
});
test('fr: aujourd\'hui', () => {
  const d = flexDate.locale("aujourd'hui", 'fr', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 15 });
});
test('fr: hier', () => {
  const d = flexDate.locale('hier', 'fr', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 14 });
});
test('de: 15 März 2025', () => {
  assertDate(flexDate.locale('15 märz 2025', 'de'), { year: 2025, month: 3, day: 15 });
});
test('de: heute', () => {
  const d = flexDate.locale('heute', 'de', { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 15 });
});
test('es: 15 marzo 2025', () => {
  assertDate(flexDate.locale('15 marzo 2025', 'es'), { year: 2025, month: 3, day: 15 });
});
test('it: 15 marzo 2025', () => {
  assertDate(flexDate.locale('15 marzo 2025', 'it'), { year: 2025, month: 3, day: 15 });
});
test('nl: 15 maart 2025', () => {
  assertDate(flexDate.locale('15 maart 2025', 'nl'), { year: 2025, month: 3, day: 15 });
});
test('ru: 15 март 2025', () => {
  assertDate(flexDate.locale('15 март 2025', 'ru'), { year: 2025, month: 3, day: 15 });
});
test('zh: 2025年3月15日', () => {
  assertDate(flexDate.locale('2025年3月15日', 'zh'), { year: 2025, month: 3, day: 15 });
});
test('custom locale', () => {
  flexDate.registerLocale('test', {
    months: ['uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce'],
    monthsShort: ['uno','dos','tres','cua','cin','sei','sie','och','nue','die','onc','doc'],
    days: [], daysShort: [],
  });
  assertDate(flexDate.locale('15 tres 2025', 'test'), { year: 2025, month: 3, day: 15 });
});
test('listLocales includes fr/de/es', () => {
  const list = flexDate.listLocales();
  assert(list.includes('fr') && list.includes('de') && list.includes('es'));
});

// ─── Range ────────────────────────────────────────────────────────────────────
console.log('\n  Range & Batch');

test('range day: 5 dates', () => {
  const dates = flexDate.range('2025-03-01', '2025-03-05', 'day');
  assert(dates.length === 5, `Expected 5, got ${dates.length}`);
  assertDate(dates[0], { year: 2025, month: 3, day: 1 });
  assertDate(dates[4], { year: 2025, month: 3, day: 5 });
});
test('range month: 3 months', () => {
  const dates = flexDate.range('2025-01-01', '2025-03-01', 'month');
  assert(dates.length === 3, `Expected 3, got ${dates.length}`);
});
test('range week', () => {
  const dates = flexDate.range('2025-03-01', '2025-03-15', 'week');
  assert(dates.length === 3, `Expected 3, got ${dates.length}`);
});
test('range empty when start > end', () => {
  const dates = flexDate.range('2025-03-10', '2025-03-01', 'day');
  assert(dates.length === 0);
});

// ─── Batch ────────────────────────────────────────────────────────────────────
test('batch parses array', () => {
  const results = flexDate.batch(['2025-03-01', 'yesterday', 'invalid xyz'], { now: REF });
  assert(results.length === 3);
  assert(results[0] instanceof Date);
  assert(results[1] instanceof Date);
  assert(results[2] === null);
});

test('sort ascending', () => {
  const dates = flexDate.sort(['tomorrow', 'yesterday', 'today'], 'asc', { now: REF });
  assert(dates.length === 3);
  assert(dates[0] < dates[1] && dates[1] < dates[2]);
});

test('sort descending', () => {
  const dates = flexDate.sort(['tomorrow', 'yesterday', 'today'], 'desc', { now: REF });
  assert(dates[0] > dates[1]);
});

test('earliest', () => {
  const d = flexDate.earliest(['tomorrow', 'yesterday', 'today'], { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 14 });
});

test('latest', () => {
  const d = flexDate.latest(['tomorrow', 'yesterday', 'today'], { now: REF });
  assertDate(d, { year: 2025, month: 6, day: 16 });
});

test('inRange true', () => {
  assert(flexDate.inRange('today', 'yesterday', 'tomorrow', { now: REF }) === true);
});

test('inRange false', () => {
  assert(flexDate.inRange('3 days ago', 'yesterday', 'tomorrow', { now: REF }) === false);
});

// ─── UMD build ────────────────────────────────────────────────────────────────
console.log('\n  UMD Build');

test('UMD loads and parses', () => {
  const umd = require('../dist/flexdate.umd.js');
  assertDate(umd('3rd March 2025'), { year: 2025, month: 3, day: 3 });
});

test('UMD format', () => {
  const umd = require('../dist/flexdate.umd.js');
  const r = umd.format('2025-03-15', 'MMMM Do, YYYY');
  assert(r === 'March 15th, 2025', `Got: ${r}`);
});

test('UMD humanize', () => {
  const umd = require('../dist/flexdate.umd.js');
  const r = umd.humanize('yesterday', { now: REF });
  assert(typeof r === 'string' && r.includes('day'));
});

test('UMD range', () => {
  // UMD doesn't bundle range — that's a separate util, just test the core
  const umd = require('../dist/flexdate.umd.js');
  assert(umd.isBefore('2025-01-01', '2025-12-31') === true);
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────
console.log('\n  Edge Cases');

test('leap year Feb 29', () => {
  assertDate(flexDate('29 February 2024'), { year: 2024, month: 2, day: 29 });
});
test('invalid Feb 29 non-leap returns null', () => {
  assert(flexDate('29 February 2025') === null);
});
test('end of month: 31 January', () => {
  assertDate(flexDate('31 January 2025'), { year: 2025, month: 1, day: 31 });
});
test('empty string returns null', () => {
  assert(flexDate('') === null);
});
test('null returns null', () => {
  assert(flexDate(null) === null);
});
test('undefined returns null', () => {
  assert(flexDate(undefined) === null);
});
test('Date object passthrough', () => {
  const d = new Date(2025, 2, 15);
  assert(flexDate(d) === d);
});
test('numeric unix ms', () => {
  const d = flexDate(1741996800000);
  assert(d instanceof Date && !isNaN(d));
});

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
