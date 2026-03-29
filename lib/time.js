'use strict';

/**
 * Time string parser
 * Handles: "3pm", "3:30pm", "15:30", "15:30:00", "noon", "midnight"
 * Can be combined with a base date.
 */

function parseTime(input, baseDate = null) {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  const base = baseDate ? new Date(baseDate) : new Date();

  if (s === 'noon') {
    base.setHours(12, 0, 0, 0);
    return base;
  }
  if (s === 'midnight') {
    base.setHours(0, 0, 0, 0);
    return base;
  }
  if (s === 'morning') {
    base.setHours(9, 0, 0, 0);
    return base;
  }
  if (s === 'afternoon') {
    base.setHours(14, 0, 0, 0);
    return base;
  }
  if (s === 'evening') {
    base.setHours(18, 0, 0, 0);
    return base;
  }
  if (s === 'night') {
    base.setHours(21, 0, 0, 0);
    return base;
  }

  // "3pm", "3:30pm", "3:30:00pm"
  const ampmMatch = s.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(am|pm)$/);
  if (ampmMatch) {
    let [, hr, min, sec, meridiem] = ampmMatch;
    hr = parseInt(hr);
    min = parseInt(min || 0);
    sec = parseInt(sec || 0);
    if (meridiem === 'pm' && hr !== 12) hr += 12;
    if (meridiem === 'am' && hr === 12) hr = 0;
    if (hr < 0 || hr > 23 || min < 0 || min > 59) return null;
    base.setHours(hr, min, sec, 0);
    return base;
  }

  // "15:30", "15:30:00"
  const h24Match = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (h24Match) {
    const [, hr, min, sec] = h24Match;
    const h = parseInt(hr);
    const m = parseInt(min);
    const sc = parseInt(sec || 0);
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    base.setHours(h, m, sc, 0);
    return base;
  }

  return null;
}

/**
 * Try to extract a time component from a string that may also have a date
 * e.g. "March 15 at 3pm", "tomorrow at noon"
 */
function extractTimeFromString(input) {
  if (!input) return { datePart: input, timePart: null };

  // "at 3pm", "at 15:30", "at noon"
  const atMatch = input.match(/\s+at\s+(.+)$/i);
  if (atMatch) {
    return {
      datePart: input.slice(0, input.length - atMatch[0].length),
      timePart: atMatch[1].trim(),
    };
  }

  // trailing time: "March 15 3pm"
  const trailingTime = input.match(/\s+(\d{1,2}(?::\d{2})?(?::\d{2})?\s*(?:am|pm))$/i);
  if (trailingTime) {
    return {
      datePart: input.slice(0, input.length - trailingTime[0].length),
      timePart: trailingTime[1].trim(),
    };
  }

  return { datePart: input, timePart: null };
}

module.exports = { parseTime, extractTimeFromString };
