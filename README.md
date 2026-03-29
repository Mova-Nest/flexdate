# flexdate

**Parse any date string, just works.**

No moment.js. No config. No dependencies. Pass any weird date format, get back a clean JS `Date`.

```js
flexDate('3rd March 2025')          // → Date
flexDate('yesterday')               // → Date
flexDate('in 3 days')               // → Date
flexDate('next friday')             // → Date
flexDate('March 15 at 3pm')         // → Date
flexDate('2 weeks ago')             // → Date
flexDate('15/03/2025')              // → Date
```

[![npm](https://img.shields.io/npm/v/flexdate)](https://www.npmjs.com/package/flexdate)
[![size](https://img.shields.io/bundlephobia/minzip/flexdate)](https://bundlephobia.com/package/flexdate)
[![license](https://img.shields.io/npm/l/flexdate)](./LICENSE)

---

## Install

```bash
npm install flexdate
# or
yarn add flexdate
# or
pnpm add flexdate
```

## Usage

### CommonJS
```js
const flexDate = require('flexdate');
```

### ESM / TypeScript
```ts
import flexDate from 'flexdate';
// or named imports:
import { format, humanize, diff } from 'flexdate';
```

---

## What it handles

### Ordinal dates
```js
flexDate('3rd March 2025')      // March 3
flexDate('1st Jan 2020')        // January 1
flexDate('22nd February 2024')  // February 22
flexDate('15th of March 2025')  // March 15
```

### Natural language
```js
flexDate('March 3rd, 2025')
flexDate('3 March 2025')
flexDate('March 2025')          // → 1st of month
flexDate('15 Jan 25')           // 2-digit year
```

### Relative dates
```js
flexDate('now')
flexDate('today')
flexDate('yesterday')
flexDate('tomorrow')
flexDate('the day after tomorrow')
flexDate('the day before yesterday')
flexDate('last week')
flexDate('next month')
flexDate('last year')
flexDate('3 days ago')
flexDate('in 2 weeks')
flexDate('7 days from now')
flexDate('a month ago')
flexDate('in an hour')
```

### Weekdays
```js
flexDate('friday')              // → upcoming Friday
flexDate('next monday')
flexDate('last thursday')
flexDate('this wednesday')
flexDate('coming tuesday')
```

### Structured formats
```js
flexDate('2025-03-15')          // ISO
flexDate('2025-03-15T10:30:00Z') // ISO 8601
flexDate('15/03/2025')          // DD/MM/YYYY
flexDate('15-03-2025')          // DD-MM-YYYY
flexDate('2025/03/15')          // YYYY/MM/DD
flexDate('2025-03-15 10:30')    // datetime
flexDate(1741996800000)         // Unix ms
flexDate(1741996800)            // Unix s (10 digits)
```

### With time
```js
flexDate('March 15 at 3pm')
flexDate('tomorrow at noon')
flexDate('yesterday at 3:30pm')
flexDate('2025-03-15 at midnight')
flexDate('next friday at 9am')
flexDate('today at 15:30')
```

---

## API

### `flexDate(input, [options])` → `Date | null`

Core function. Returns a `Date` or `null` if unparseable.

```js
flexDate('3rd March 2025')            // → Date
flexDate('not a date')                // → null
flexDate('yesterday', { now: ref })   // relative to custom "now"
flexDate('2025-03-15', { timezone: 'America/New_York' })
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `now` | `Date` | Reference for relative dates (default: `new Date()`) |
| `timezone` | `string` | IANA tz name or UTC offset, e.g. `'America/New_York'`, `'+05:30'` |
| `strict` | `boolean` | Throw instead of returning `null` on failure |

---

### `flexDate.parse(input, [options])` → `Date`

Like `flexDate()` but **throws** on failure instead of returning `null`.

```js
flexDate.parse('3rd March 2025')   // → Date
flexDate.parse('garbage')          // throws Error
```

---

### `flexDate.try(input, [options])` → `Date | null`

Alias for `flexDate()` with `strict: false`. Never throws.

---

### `flexDate.isValid(input, [options])` → `boolean`

```js
flexDate.isValid('3rd March 2025')  // → true
flexDate.isValid('not a date')      // → false
```

---

### `flexDate.format(input, fmt, [options])` → `string | null`

Format a date string using tokens.

```js
flexDate.format('3rd March 2025', 'MMMM Do, YYYY')  // → 'March 3rd, 2025'
flexDate.format('2025-03-15', 'DD/MM/YYYY')          // → '15/03/2025'
flexDate.format('tomorrow', 'dddd, MMMM D')          // → 'Sunday, March 16'
```

**Tokens:**

| Token | Example | Description |
|-------|---------|-------------|
| `YYYY` | 2025 | 4-digit year |
| `YY` | 25 | 2-digit year |
| `MMMM` | March | Full month name |
| `MMM` | Mar | Short month name |
| `MM` | 03 | Month, padded |
| `M` | 3 | Month, no pad |
| `DD` | 15 | Day, padded |
| `D` | 15 | Day, no pad |
| `Do` | 15th | Day with ordinal |
| `dddd` | Saturday | Full weekday |
| `ddd` | Sat | Short weekday |
| `HH` | 15 | 24h hour, padded |
| `H` | 15 | 24h hour, no pad |
| `hh` | 03 | 12h hour, padded |
| `h` | 3 | 12h hour, no pad |
| `mm` | 30 | Minutes, padded |
| `ss` | 00 | Seconds, padded |
| `A` | PM | Meridiem uppercase |
| `a` | pm | Meridiem lowercase |
| `x` | 1741996800000 | Unix ms |
| `X` | 1741996800 | Unix s |

---

### `flexDate.humanize(input, [options])` → `string | null`

Returns a friendly relative string.

```js
flexDate.humanize('yesterday')        // → '1 day ago'
flexDate.humanize('in 3 days')        // → 'in 3 days'
flexDate.humanize('2 hours ago')      // → '2 hours ago'
flexDate.humanize('now')              // → 'just now'
```

---

### `flexDate.tz(input, timezone, [options])` → `Date | null`

Parse and convert to a timezone.

```js
flexDate.tz('2025-03-15 10:00', 'America/New_York')
flexDate.tz('today', 'Asia/Kolkata')
flexDate.tz('tomorrow', '+05:30')
```

---

### `flexDate.diff(a, b, unit, [options])` → `number | null`

Difference between two dates.

```js
flexDate.diff('tomorrow', 'yesterday', 'days')  // → 2
flexDate.diff('in 1 hour', 'now', 'minutes')    // → 60
```

**Units:** `ms`, `milliseconds`, `s`, `seconds`, `m`, `minutes`, `h`, `hours`, `d`, `days`, `w`, `weeks`

---

### `flexDate.add(input, amount, unit, [options])` → `Date | null`

```js
flexDate.add('today', 5, 'days')
flexDate.add('2025-03-01', 1, 'month')
flexDate.add('now', 30, 'minutes')
```

---

### `flexDate.subtract(input, amount, unit, [options])` → `Date | null`

```js
flexDate.subtract('today', 1, 'week')
flexDate.subtract('2025-03-15', 3, 'days')
```

---

### `flexDate.isBefore(a, b, [options])` → `boolean | null`

```js
flexDate.isBefore('yesterday', 'tomorrow')  // → true
```

---

### `flexDate.isAfter(a, b, [options])` → `boolean | null`

```js
flexDate.isAfter('next week', 'yesterday')  // → true
```

---

### `flexDate.isSameDay(a, b, [options])` → `boolean | null`

```js
flexDate.isSameDay('today', 'now')               // → true
flexDate.isSameDay('March 15 2025', '2025-03-15') // → true
```

---

### `flexDate.startOf(input, unit, [options])` → `Date | null`

```js
flexDate.startOf('2025-03-15', 'month')   // → 2025-03-01 00:00:00
flexDate.startOf('today', 'year')         // → 2025-01-01 00:00:00
flexDate.startOf('now', 'week')           // → Sunday 00:00:00
```

**Units:** `second`, `minute`, `hour`, `day`, `week`, `month`, `year`

---

### `flexDate.endOf(input, unit, [options])` → `Date | null`

```js
flexDate.endOf('2025-03-15', 'month')    // → 2025-03-31 23:59:59.999
flexDate.endOf('today', 'day')           // → today 23:59:59.999
```

---

## Platform Support

`flexdate` has zero dependencies and works everywhere:

| Platform | Support |
|----------|---------|
| Node.js 12+ | ✅ |
| Vercel (Edge & Serverless) | ✅ |
| Netlify Functions | ✅ |
| Cloudflare Workers | ✅ |
| Deno | ✅ (via npm compat) |
| Browsers (ESM) | ✅ |
| React Native | ✅ |
| Next.js (App & Pages) | ✅ |
| Remix | ✅ |
| Astro | ✅ |
| Vite / Rollup / Webpack | ✅ |

---

## TypeScript

Full TypeScript support is built in — no `@types` package needed.

```ts
import flexDate, { flexDateOptions } from 'flexdate';

const opts: flexDateOptions = { timezone: 'America/New_York' };
const d: Date | null = flexDate('3rd March 2025', opts);
```

---

## License

MIT © **DanuZz**
