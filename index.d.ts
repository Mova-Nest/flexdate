/**
 * flexdate — Parse any date string, just works.
 */

export interface flexDateOptions {
  /** Reference point for relative dates. Default: new Date() */
  now?: Date;
  /** IANA timezone name or UTC offset string (e.g. 'America/New_York', '+05:30') */
  timezone?: string;
  /** Throw an error instead of returning null when parsing fails */
  strict?: boolean;
}

/**
 * Parse any date/time string into a JS Date.
 * Returns null if unparseable (unless strict: true).
 */
declare function flexDate(input: string | number | Date, options?: flexDateOptions): Date | null;

declare namespace flexDate {
  /** Parse or throw on failure */
  function parse(input: string | number | Date, options?: flexDateOptions): Date;

  /** Parse, never throws, returns null on failure */
  function try_(input: string | number | Date, options?: flexDateOptions): Date | null;

  /** Returns true if the input is parseable */
  function isValid(input: string | number | Date, options?: flexDateOptions): boolean;

  /**
   * Format a date string using format tokens.
   * Tokens: YYYY, MM, DD, HH, mm, ss, MMMM, MMM, Do, dddd, ddd, A, a, x, X
   */
  function format(input: string | number | Date, fmt: string, options?: flexDateOptions): string | null;

  /** Humanize a date relative to now: "3 days ago", "in 2 hours" */
  function humanize(input: string | number | Date, options?: flexDateOptions): string | null;

  /** Parse and convert to a specific timezone */
  function tz(input: string | number | Date, timezone: string, options?: flexDateOptions): Date | null;

  /**
   * Difference between two date strings.
   * @param unit 'ms' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks'
   */
  function diff(
    a: string | number | Date,
    b: string | number | Date,
    unit?: 'ms' | 'milliseconds' | 's' | 'seconds' | 'm' | 'minutes' | 'h' | 'hours' | 'd' | 'days' | 'w' | 'weeks',
    options?: flexDateOptions
  ): number | null;

  /** Add a duration to a parsed date */
  function add(
    input: string | number | Date,
    amount: number,
    unit: string,
    options?: flexDateOptions
  ): Date | null;

  /** Subtract a duration from a parsed date */
  function subtract(
    input: string | number | Date,
    amount: number,
    unit: string,
    options?: flexDateOptions
  ): Date | null;

  /** Is date a before date b? */
  function isBefore(a: string | number | Date, b: string | number | Date, options?: flexDateOptions): boolean | null;

  /** Is date a after date b? */
  function isAfter(a: string | number | Date, b: string | number | Date, options?: flexDateOptions): boolean | null;

  /** Are two dates on the same calendar day? */
  function isSameDay(a: string | number | Date, b: string | number | Date, options?: flexDateOptions): boolean | null;

  /** Start of a calendar unit */
  function startOf(
    input: string | number | Date,
    unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
    options?: flexDateOptions
  ): Date | null;

  /** End of a calendar unit */
  function endOf(
    input: string | number | Date,
    unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
    options?: flexDateOptions
  ): Date | null;

  const default: typeof flexDate;
}

export default flexDate;
export = flexDate;
