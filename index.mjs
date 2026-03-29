// ESM wrapper — allows:
//   import flexDate from 'flexdate'
//   import { flexDate } from 'flexdate'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const flexDate = require('./index.js');

export default flexDate;
export const parse      = flexDate.parse;
export const isValid    = flexDate.isValid;
export const format     = flexDate.format;
export const humanize   = flexDate.humanize;
export const tz         = flexDate.tz;
export const diff       = flexDate.diff;
export const add        = flexDate.add;
export const subtract   = flexDate.subtract;
export const isBefore   = flexDate.isBefore;
export const isAfter    = flexDate.isAfter;
export const isSameDay  = flexDate.isSameDay;
export const startOf    = flexDate.startOf;
export const endOf      = flexDate.endOf;
