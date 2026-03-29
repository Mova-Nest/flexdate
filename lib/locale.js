'use strict';

/**
 * Locale support for flexdate
 * Allows parsing date strings in other languages.
 *
 * Usage:
 *   const { registerLocale, parseLocale } = require('flexdate/lib/locale');
 *   registerLocale('fr', frLocale);
 *   parseLocale('15 mars 2025', 'fr') // → Date
 */

/** @type {Map<string, LocaleDefinition>} */
const locales = new Map();

/**
 * @typedef {Object} LocaleDefinition
 * @property {string[]} months      - Full month names (12), index 0 = January
 * @property {string[]} monthsShort - Short month names (12)
 * @property {string[]} days        - Full weekday names (7), index 0 = Sunday
 * @property {string[]} daysShort   - Short weekday names (7)
 * @property {Object}   [relative]  - Relative keyword overrides
 */

// Built-in locales
const BUILTIN_LOCALES = {
  fr: {
    months: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
    monthsShort: ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'],
    days: ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],
    daysShort: ['dim','lun','mar','mer','jeu','ven','sam'],
    relative: { today: "aujourd'hui", yesterday: 'hier', tomorrow: 'demain' },
  },
  de: {
    months: ['januar','februar','märz','april','mai','juni','juli','august','september','oktober','november','dezember'],
    monthsShort: ['jan','feb','mär','apr','mai','jun','jul','aug','sep','okt','nov','dez'],
    days: ['sonntag','montag','dienstag','mittwoch','donnerstag','freitag','samstag'],
    daysShort: ['so','mo','di','mi','do','fr','sa'],
    relative: { today: 'heute', yesterday: 'gestern', tomorrow: 'morgen' },
  },
  es: {
    months: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
    monthsShort: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
    days: ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
    daysShort: ['dom','lun','mar','mié','jue','vie','sáb'],
    relative: { today: 'hoy', yesterday: 'ayer', tomorrow: 'mañana' },
  },
  pt: {
    months: ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],
    monthsShort: ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],
    days: ['domingo','segunda','terça','quarta','quinta','sexta','sábado'],
    daysShort: ['dom','seg','ter','qua','qui','sex','sáb'],
    relative: { today: 'hoje', yesterday: 'ontem', tomorrow: 'amanhã' },
  },
  it: {
    months: ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'],
    monthsShort: ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'],
    days: ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'],
    daysShort: ['dom','lun','mar','mer','gio','ven','sab'],
    relative: { today: 'oggi', yesterday: 'ieri', tomorrow: 'domani' },
  },
  nl: {
    months: ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'],
    monthsShort: ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'],
    days: ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'],
    daysShort: ['zo','ma','di','wo','do','vr','za'],
    relative: { today: 'vandaag', yesterday: 'gisteren', tomorrow: 'morgen' },
  },
  ru: {
    months: ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'],
    monthsShort: ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],
    days: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
    daysShort: ['вс','пн','вт','ср','чт','пт','сб'],
    relative: { today: 'сегодня', yesterday: 'вчера', tomorrow: 'завтра' },
  },
  zh: {
    months: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    monthsShort: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    days: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
    daysShort: ['日','一','二','三','四','五','六'],
    relative: { today: '今天', yesterday: '昨天', tomorrow: '明天' },
  },
  ja: {
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    monthsShort: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    days: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
    daysShort: ['日','月','火','水','木','金','土'],
    relative: { today: '今日', yesterday: '昨日', tomorrow: '明日' },
  },
  ar: {
    months: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    monthsShort: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    days: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
    daysShort: ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'],
    relative: { today: 'اليوم', yesterday: 'أمس', tomorrow: 'غداً' },
  },
};

// Pre-load builtins
for (const [key, val] of Object.entries(BUILTIN_LOCALES)) {
  locales.set(key, val);
}

/**
 * Register a custom locale.
 * @param {string} tag - BCP-47 language tag (e.g. 'fr', 'de', 'zh-TW')
 * @param {LocaleDefinition} def
 */
function registerLocale(tag, def) {
  locales.set(tag.toLowerCase(), def);
}

/**
 * Parse a date string using a specific locale.
 * Falls back to the English parser if no locale match.
 *
 * @param {string} input
 * @param {string} locale - BCP-47 language tag
 * @param {Date}   [now]
 * @returns {Date|null}
 */
function parseLocale(input, locale, now = new Date()) {
  const def = locales.get(locale.toLowerCase());
  if (!def) return null;

  const s = input.trim().toLowerCase();

  // Check relative keywords
  if (def.relative) {
    const rel = def.relative;
    if (rel.today && s === rel.today.toLowerCase()) {
      const d = new Date(now); d.setHours(0, 0, 0, 0); return d;
    }
    if (rel.yesterday && s === rel.yesterday.toLowerCase()) {
      const d = new Date(now); d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0); return d;
    }
    if (rel.tomorrow && s === rel.tomorrow.toLowerCase()) {
      const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d;
    }
  }

  // Build month lookup (both full and short, lowercased)
  const monthLookup = new Map();
  def.months.forEach((m, i) => monthLookup.set(m.toLowerCase(), i));
  def.monthsShort.forEach((m, i) => monthLookup.set(m.toLowerCase(), i));

  // Build weekday lookup
  const dayLookup = new Map();
  def.days.forEach((d, i) => dayLookup.set(d.toLowerCase(), i));
  def.daysShort.forEach((d, i) => dayLookup.set(d.toLowerCase(), i));

  // Try patterns: "15 mars 2025", "mars 15, 2025", "15 mars"
  for (const [monthName, monthIdx] of monthLookup) {
    // "D Month YYYY" or "D Month"
    const dmyRe = new RegExp(`^(\\d{1,4})\\s+${escapeRe(monthName)}\\s*(\\d{4})?$`);
    const dmyM = s.match(dmyRe);
    if (dmyM) {
      const day = parseInt(dmyM[1]);
      const year = dmyM[2] ? parseInt(dmyM[2]) : now.getFullYear();
      if (day >= 1 && day <= 31) return new Date(year, monthIdx, day);
    }

    // "Month D, YYYY" or "Month D"
    const mdyRe = new RegExp(`^${escapeRe(monthName)}\\s+(\\d{1,2}),?\\s*(\\d{4})?$`);
    const mdyM = s.match(mdyRe);
    if (mdyM) {
      const day = parseInt(mdyM[1]);
      const year = mdyM[2] ? parseInt(mdyM[2]) : now.getFullYear();
      if (day >= 1 && day <= 31) return new Date(year, monthIdx, day);
    }

    // "Month YYYY"
    const myRe = new RegExp(`^${escapeRe(monthName)}\\s+(\\d{4})$`);
    const myM = s.match(myRe);
    if (myM) return new Date(parseInt(myM[1]), monthIdx, 1);
  }

  // CJK patterns: "2025年3月15日"
  const cjkFull = s.match(/^(\d{4})[年\s](\d{1,2})[月\s](\d{1,2})[日号]?$/);
  if (cjkFull) return new Date(parseInt(cjkFull[1]), parseInt(cjkFull[2]) - 1, parseInt(cjkFull[3]));

  const cjkShort = s.match(/^(\d{1,2})[月\s](\d{1,2})[日号]?$/);
  if (cjkShort) return new Date(now.getFullYear(), parseInt(cjkShort[1]) - 1, parseInt(cjkShort[2]));

  return null;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * List all registered locale codes.
 */
function listLocales() {
  return Array.from(locales.keys());
}

module.exports = { registerLocale, parseLocale, listLocales, BUILTIN_LOCALES };
