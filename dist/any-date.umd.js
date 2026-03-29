/*!
 * flexdate v1.0.0
 * Parse any date string, just works.
 * https://github.com/Mova-Nest/flexdate
 * MIT License
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.flexDate = factory());
})(this, function () {
  'use strict';

  // ─── relative.js ─────────────────────────────────────────────────────────────
  var UNITS = {
    second: 1000, seconds: 1000, sec: 1000, secs: 1000,
    minute: 60000, minutes: 60000, min: 60000, mins: 60000,
    hour: 3600000, hours: 3600000, hr: 3600000, hrs: 3600000,
    day: 86400000, days: 86400000,
    week: 604800000, weeks: 604800000, wk: 604800000, wks: 604800000,
    month: 2592000000, months: 2592000000, mo: 2592000000,
    year: 31536000000, years: 31536000000, yr: 31536000000, yrs: 31536000000,
  };

  var WORD_NUMBERS = {
    a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30,
  };

  function startOfDay(date) {
    var d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseRelative(input, now) {
    var s = input.trim().toLowerCase();
    if (s === 'now') return new Date(now);
    if (s === 'today') return startOfDay(now);
    if (s === 'yesterday') { var d = new Date(now); d.setDate(d.getDate() - 1); return startOfDay(d); }
    if (s === 'tomorrow') { var d = new Date(now); d.setDate(d.getDate() + 1); return startOfDay(d); }
    if (s === 'the day after tomorrow') { var d = new Date(now); d.setDate(d.getDate() + 2); return startOfDay(d); }
    if (s === 'the day before yesterday') { var d = new Date(now); d.setDate(d.getDate() - 2); return startOfDay(d); }
    if (s === 'last week') { var d = new Date(now); d.setDate(d.getDate() - 7); return startOfDay(d); }
    if (s === 'next week') { var d = new Date(now); d.setDate(d.getDate() + 7); return startOfDay(d); }
    if (s === 'last month') { var d = new Date(now); d.setMonth(d.getMonth() - 1); return startOfDay(d); }
    if (s === 'next month') { var d = new Date(now); d.setMonth(d.getMonth() + 1); return startOfDay(d); }
    if (s === 'last year') { var d = new Date(now); d.setFullYear(d.getFullYear() - 1); return startOfDay(d); }
    if (s === 'next year') { var d = new Date(now); d.setFullYear(d.getFullYear() + 1); return startOfDay(d); }

    var agoMatch = s.match(/^(\d+|\w+)\s+(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours|hr|hrs|day|days|week|weeks|wk|wks|month|months|mo|year|years|yr|yrs)\s+ago$/);
    if (agoMatch) {
      var amount = parseInt(agoMatch[1]) || WORD_NUMBERS[agoMatch[1]] || 1;
      var unit = UNITS[agoMatch[2]];
      if (unit) return new Date(now.getTime() - amount * unit);
    }
    var inMatch = s.match(/^in\s+(\d+|\w+)\s+(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours|hr|hrs|day|days|week|weeks|wk|wks|month|months|mo|year|years|yr|yrs)$/);
    if (inMatch) {
      var amount = parseInt(inMatch[1]) || WORD_NUMBERS[inMatch[1]] || 1;
      var unit = UNITS[inMatch[2]];
      if (unit) return new Date(now.getTime() + amount * unit);
    }
    var fromNowMatch = s.match(/^(\d+|\w+)\s+(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours|hr|hrs|day|days|week|weeks|wk|wks|month|months|mo|year|years|yr|yrs)\s+from\s+now$/);
    if (fromNowMatch) {
      var amount = parseInt(fromNowMatch[1]) || WORD_NUMBERS[fromNowMatch[1]] || 1;
      var unit = UNITS[fromNowMatch[2]];
      if (unit) return new Date(now.getTime() + amount * unit);
    }
    var aWordAgoMatch = s.match(/^(a|an)\s+(second|minute|hour|day|week|month|year)\s+ago$/);
    if (aWordAgoMatch) {
      var unit = UNITS[aWordAgoMatch[2]];
      if (unit) return new Date(now.getTime() - unit);
    }
    return null;
  }

  // ─── natural.js ──────────────────────────────────────────────────────────────
  var MONTHS = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
    april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
    august: 7, aug: 7, september: 8, sep: 8, sept: 8,
    october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
  };

  var DAYS_OF_WEEK = {
    sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2,
    wednesday: 3, wed: 3, thursday: 4, thu: 4, thur: 4, thurs: 4,
    friday: 5, fri: 5, saturday: 6, sat: 6,
  };

  function stripOrdinal(s) { return s.replace(/(\d+)(st|nd|rd|th)/gi, '$1'); }

  function makeDate(year, month, day) {
    if (month < 0 || month > 11 || day < 1 || day > 31) return null;
    var d = new Date(year, month, day);
    if (d.getMonth() !== month) return null;
    return d;
  }

  function inferYear(y) { var n = parseInt(y); return n <= 30 ? 2000 + n : 1900 + n; }

  function resolveWeekday(targetDay, now, direction) {
    var d = new Date(now);
    var diff = targetDay - d.getDay();
    if (direction === 'next') { if (diff <= 0) diff += 7; }
    else if (direction === 'last') { if (diff >= 0) diff -= 7; }
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseNatural(input, now) {
    if (!input || typeof input !== 'string') return null;
    var s = input.trim();

    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(s)) {
      var d = new Date(s); if (!isNaN(d)) return d;
    }
    if (/^\d{13}$/.test(s)) return new Date(parseInt(s));
    if (/^\d{10}$/.test(s)) return new Date(parseInt(s) * 1000);

    var lower = s.toLowerCase();
    var dowMatch = lower.match(/^(next|last|this|coming)\s+(sunday|sun|monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thur|thurs|friday|fri|saturday|sat)$/);
    if (dowMatch) {
      var dir = dowMatch[1] === 'last' ? 'last' : 'next';
      var day = DAYS_OF_WEEK[dowMatch[2]];
      if (day !== undefined) return resolveWeekday(day, now, dir);
    }
    if (DAYS_OF_WEEK[lower] !== undefined) return resolveWeekday(DAYS_OF_WEEK[lower], now, 'next');

    var clean = stripOrdinal(s);

    var slashFull = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
    if (slashFull) {
      var a = parseInt(slashFull[1]), b = parseInt(slashFull[2]);
      var yr = slashFull[3].length === 2 ? inferYear(slashFull[3]) : parseInt(slashFull[3]);
      if (a > 12) return makeDate(yr, b - 1, a);
      if (b > 12) return makeDate(yr, a - 1, b);
      return makeDate(yr, b - 1, a);
    }
    var ymdSlash = clean.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymdSlash) return makeDate(parseInt(ymdSlash[1]), parseInt(ymdSlash[2]) - 1, parseInt(ymdSlash[3]));

    var dmyText = clean.match(/^(\d{1,2})\s+([a-zA-Z]+)\s*(\d{4})?$/);
    if (dmyText) {
      var mo = MONTHS[dmyText[2].toLowerCase()];
      if (mo !== undefined) return makeDate(dmyText[3] ? parseInt(dmyText[3]) : now.getFullYear(), mo, parseInt(dmyText[1]));
    }
    var mdyText = clean.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s*(\d{4})?$/);
    if (mdyText) {
      var mo = MONTHS[mdyText[1].toLowerCase()];
      if (mo !== undefined) return makeDate(mdyText[3] ? parseInt(mdyText[3]) : now.getFullYear(), mo, parseInt(mdyText[2]));
    }
    var myText = clean.match(/^([a-zA-Z]+)\s+(\d{4})$/);
    if (myText) {
      var mo = MONTHS[myText[1].toLowerCase()];
      if (mo !== undefined) return makeDate(parseInt(myText[2]), mo, 1);
    }
    var dmyShort = clean.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{2})$/);
    if (dmyShort) {
      var mo = MONTHS[dmyShort[2].toLowerCase()];
      if (mo !== undefined) return makeDate(inferYear(dmyShort[3]), mo, parseInt(dmyShort[1]));
    }
    var dtMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (dtMatch) return new Date(parseInt(dtMatch[1]), parseInt(dtMatch[2]) - 1, parseInt(dtMatch[3]), parseInt(dtMatch[4]), parseInt(dtMatch[5]), parseInt(dtMatch[6] || 0));

    var ofMatch = clean.match(/^(\d{1,2})\s+of\s+([a-zA-Z]+)\s*(\d{4})?$/i);
    if (ofMatch) {
      var mo = MONTHS[ofMatch[2].toLowerCase()];
      if (mo !== undefined) return makeDate(ofMatch[3] ? parseInt(ofMatch[3]) : now.getFullYear(), mo, parseInt(ofMatch[1]));
    }

    var fallback = new Date(s);
    if (!isNaN(fallback.getTime())) return fallback;
    return null;
  }

  // ─── time.js ─────────────────────────────────────────────────────────────────
  function parseTime(input, baseDate) {
    if (!input) return null;
    var s = input.trim().toLowerCase();
    var base = baseDate ? new Date(baseDate) : new Date();
    var timeWords = { noon: [12,0,0], midnight: [0,0,0], morning: [9,0,0], afternoon: [14,0,0], evening: [18,0,0], night: [21,0,0] };
    if (timeWords[s]) { base.setHours.apply(base, timeWords[s].concat([0])); return base; }

    var ampm = s.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(am|pm)$/);
    if (ampm) {
      var hr = parseInt(ampm[1]), mn = parseInt(ampm[2] || 0), sc = parseInt(ampm[3] || 0);
      if (ampm[4] === 'pm' && hr !== 12) hr += 12;
      if (ampm[4] === 'am' && hr === 12) hr = 0;
      base.setHours(hr, mn, sc, 0); return base;
    }
    var h24 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (h24) { base.setHours(parseInt(h24[1]), parseInt(h24[2]), parseInt(h24[3] || 0), 0); return base; }
    return null;
  }

  function extractTimeFromString(input) {
    if (!input) return { datePart: input, timePart: null };
    var atMatch = input.match(/\s+at\s+(.+)$/i);
    if (atMatch) return { datePart: input.slice(0, input.length - atMatch[0].length), timePart: atMatch[1].trim() };
    var trailing = input.match(/\s+(\d{1,2}(?::\d{2})?(?::\d{2})?\s*(?:am|pm))$/i);
    if (trailing) return { datePart: input.slice(0, input.length - trailing[0].length), timePart: trailing[1].trim() };
    return { datePart: input, timePart: null };
  }

  // ─── timezone.js ─────────────────────────────────────────────────────────────
  var COMMON_OFFSETS = {
    utc: 0, gmt: 0, est: -300, edt: -240, cst: -360, cdt: -300,
    mst: -420, mdt: -360, pst: -480, pdt: -420, ist: 330, jst: 540,
    cet: 60, cest: 120, aest: 600, nzst: 720,
  };

  function toTimezone(date, tz) {
    if (!date || isNaN(date.getTime())) return date;
    try {
      var fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      });
      var parts = fmt.formatToParts(date);
      var get = function(t) { return parts.find(function(p) { return p.type === t; }).value; };
      var hr = parseInt(get('hour'));
      return new Date(parseInt(get('year')), parseInt(get('month')) - 1, parseInt(get('day')), hr === 24 ? 0 : hr, parseInt(get('minute')), parseInt(get('second')));
    } catch (_) {}
    var lower = tz.toLowerCase().trim();
    var offsetMins = COMMON_OFFSETS[lower];
    if (offsetMins === undefined) {
      var m = tz.match(/^([+-])(\d{2}):?(\d{2})$/);
      if (m) offsetMins = (m[1] === '+' ? 1 : -1) * (parseInt(m[2]) * 60 + parseInt(m[3]));
    }
    if (offsetMins !== undefined) {
      return new Date(date.getTime() + date.getTimezoneOffset() * 60000 + offsetMins * 60000);
    }
    return date;
  }

  // ─── format.js ───────────────────────────────────────────────────────────────
  var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var MONTH_ABBR = MONTH_NAMES.map(function(m) { return m.slice(0,3); });
  var DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var DAY_ABBR = DAY_NAMES.map(function(d) { return d.slice(0,3); });

  function pad(n, len) { return String(n).padStart(len || 2, '0'); }
  function ordinalSuffix(n) { var s = ['th','st','nd','rd']; var v = n % 100; return s[(v-20)%10] || s[v] || s[0]; }

  function formatDate(date, fmt) {
    if (!date || isNaN(date.getTime())) return '';
    if (!fmt) fmt = 'YYYY-MM-DD';
    var yr = date.getFullYear(), mo = date.getMonth(), dy = date.getDate(),
        wd = date.getDay(), hr = date.getHours(), mn = date.getMinutes(),
        sc = date.getSeconds(), h12 = hr % 12 || 12;
    var tokens = {
      YYYY: String(yr), YY: String(yr).slice(-2),
      MMMM: MONTH_NAMES[mo], MMM: MONTH_ABBR[mo],
      MM: pad(mo+1), M: String(mo+1),
      DD: pad(dy), D: String(dy), Do: dy + ordinalSuffix(dy),
      dddd: DAY_NAMES[wd], ddd: DAY_ABBR[wd],
      HH: pad(hr), H: String(hr), hh: pad(h12), h: String(h12),
      mm: pad(mn), ss: pad(sc),
      A: hr < 12 ? 'AM' : 'PM', a: hr < 12 ? 'am' : 'pm',
      x: String(date.getTime()), X: String(Math.floor(date.getTime()/1000)),
    };
    var keys = Object.keys(tokens).sort(function(a,b){ return b.length - a.length; });
    var escaped = keys.map(function(k){ return k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); });
    return fmt.replace(new RegExp(escaped.join('|'),'g'), function(m){ return tokens[m] !== undefined ? tokens[m] : m; });
  }

  function humanize(date, from) {
    if (!date || isNaN(date.getTime())) return '';
    from = from || new Date();
    var diffMs = date.getTime() - from.getTime(), abs = Math.abs(diffMs), future = diffMs > 0;
    var thresholds = [
      { limit: 45000, label: 'just now', skipDir: true },
      { limit: 90000, unit: 'a minute' },
      { limit: 2700000, divisor: 60000, unit: 'minutes' },
      { limit: 5400000, unit: 'an hour' },
      { limit: 79200000, divisor: 3600000, unit: 'hours' },
      { limit: 129600000, unit: 'a day' },
      { limit: 2160000000, divisor: 86400000, unit: 'days' },
      { limit: 3888000000, unit: 'a month' },
      { limit: 29808000000, divisor: 2592000000, unit: 'months' },
      { limit: 47088000000, unit: 'a year' },
      { limit: Infinity, divisor: 31536000000, unit: 'years' },
    ];
    for (var i = 0; i < thresholds.length; i++) {
      var t = thresholds[i];
      if (abs < t.limit) {
        if (t.skipDir) return t.label;
        var count = t.divisor ? Math.round(abs / t.divisor) : null;
        var label = count ? count + ' ' + t.unit : t.unit;
        return future ? 'in ' + label : label + ' ago';
      }
    }
    return formatDate(date, 'MMMM D, YYYY');
  }

  // ─── core flexDate ─────────────────────────────────────────────────────────────
  function unitToMs(unit) {
    var map = { ms:1, milliseconds:1, millisecond:1, s:1000, seconds:1000, second:1000, m:60000, minutes:60000, minute:60000, h:3600000, hours:3600000, hour:3600000, d:86400000, days:86400000, day:86400000, w:604800000, weeks:604800000, week:604800000 };
    return map[unit] != null ? map[unit] : null;
  }

  function flexDate(input, options) {
    options = options || {};
    if (input instanceof Date) return isNaN(input.getTime()) ? _fail(input, options) : input;
    if (typeof input === 'number') { var d = new Date(input); return isNaN(d.getTime()) ? _fail(input, options) : d; }
    if (typeof input !== 'string' || !input.trim()) return _fail(input, options);

    var now = options.now instanceof Date ? options.now : new Date();
    var extracted = extractTimeFromString(input.trim());
    var datePart = extracted.datePart, timePart = extracted.timePart;

    var result = parseRelative(datePart.trim(), now) || parseNatural(datePart.trim(), now);
    if (result && timePart) { var wt = parseTime(timePart, result); if (wt) result = wt; }
    if (!result && !datePart.trim() && timePart) result = parseTime(timePart, now);
    if (result && options.timezone) result = toTimezone(result, options.timezone);
    if (!result) return _fail(input, options);
    return result;
  }

  function _fail(input, options) {
    if (options.strict) throw new Error('[flexdate] Unable to parse: "' + input + '"');
    return null;
  }

  flexDate.parse     = function(i, o) { return flexDate(i, Object.assign({}, o, { strict: true })); };
  flexDate.try       = function(i, o) { return flexDate(i, Object.assign({}, o, { strict: false })); };
  flexDate.isValid   = function(i, o) { return flexDate(i, Object.assign({}, o, { strict: false })) !== null; };
  flexDate.format    = function(i, fmt, o) { var d = flexDate(i, o); return d ? formatDate(d, fmt) : null; };
  flexDate.humanize  = function(i, o) { var d = flexDate(i, o); return d ? humanize(d, (o||{}).now || new Date()) : null; };
  flexDate.tz        = function(i, tz, o) { return flexDate(i, Object.assign({}, o, { timezone: tz })); };
  flexDate.diff      = function(a, b, unit, o) {
    var da = flexDate(a, o), db = flexDate(b, o);
    if (!da || !db) return null;
    var div = unitToMs(unit || 'ms') || 1;
    return (da.getTime() - db.getTime()) / div;
  };
  flexDate.add       = function(i, n, unit, o) { var d = flexDate(i, o); if (!d) return null; var ms = unitToMs(unit); return ms !== null ? new Date(d.getTime() + n * ms) : null; };
  flexDate.subtract  = function(i, n, unit, o) { return flexDate.add(i, -n, unit, o); };
  flexDate.isBefore  = function(a, b, o) { var da = flexDate(a,o), db = flexDate(b,o); return da && db ? da.getTime() < db.getTime() : null; };
  flexDate.isAfter   = function(a, b, o) { var da = flexDate(a,o), db = flexDate(b,o); return da && db ? da.getTime() > db.getTime() : null; };
  flexDate.isSameDay = function(a, b, o) {
    var da = flexDate(a,o), db = flexDate(b,o);
    return da && db ? da.getFullYear()===db.getFullYear() && da.getMonth()===db.getMonth() && da.getDate()===db.getDate() : null;
  };
  flexDate.startOf = function(i, unit, o) {
    var d = flexDate(i, o); if (!d) return null;
    var r = new Date(d);
    if (unit==='second') r.setMilliseconds(0);
    else if (unit==='minute') r.setSeconds(0,0);
    else if (unit==='hour') r.setMinutes(0,0,0);
    else if (unit==='day') r.setHours(0,0,0,0);
    else if (unit==='week') { r.setDate(r.getDate()-r.getDay()); r.setHours(0,0,0,0); }
    else if (unit==='month') { r.setDate(1); r.setHours(0,0,0,0); }
    else if (unit==='year') { r.setMonth(0,1); r.setHours(0,0,0,0); }
    return r;
  };
  flexDate.endOf = function(i, unit, o) {
    var d = flexDate(i, o); if (!d) return null;
    var r = new Date(d);
    if (unit==='second') r.setMilliseconds(999);
    else if (unit==='minute') r.setSeconds(59,999);
    else if (unit==='hour') r.setMinutes(59,59,999);
    else if (unit==='day') r.setHours(23,59,59,999);
    else if (unit==='week') { r.setDate(r.getDate()+(6-r.getDay())); r.setHours(23,59,59,999); }
    else if (unit==='month') { r.setMonth(r.getMonth()+1,0); r.setHours(23,59,59,999); }
    else if (unit==='year') { r.setMonth(11,31); r.setHours(23,59,59,999); }
    return r;
  };

  flexDate.default = flexDate;
  return flexDate;
});
