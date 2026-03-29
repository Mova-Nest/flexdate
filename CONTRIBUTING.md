# Contributing to flexdate

First off, thank you for taking the time to contribute! 🎉

Whether you're fixing a bug, adding locale support, improving docs, or suggesting an idea — all contributions are welcome and appreciated.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Adding a New Locale](#adding-a-new-locale)
- [Adding a New Date Format](#adding-a-new-date-format)
- [Running Tests](#running-tests)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Commit Message Convention](#commit-message-convention)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/Mova-Nest/flexdate.git
   cd flexdate
   ```
3. **No install needed** — zero dependencies means you can start immediately:
   ```bash
   node test/index.test.js
   node test/advanced.test.js
   ```

---

## Development Setup

Requirements: **Node.js 12+** (no other tools needed)

```bash
# Run all tests
npm test

# Run a specific test file
node test/index.test.js
node test/advanced.test.js

# Try a quick parse in the REPL
node -e "const d = require('.'); console.log(d('3rd March 2025'))"
```

---

## Project Structure

```
flexdate/
├── index.js            ← Main entry point, exports flexDate + all methods
├── index.mjs           ← ESM re-export wrapper
├── index.d.ts          ← TypeScript definitions
├── lib/
│   ├── relative.js     ← Relative expressions: "yesterday", "3 days ago"
│   ├── natural.js      ← Natural language + structured: "3rd March 2025"
│   ├── time.js         ← Time parsing: "at 3pm", "noon", "15:30"
│   ├── format.js       ← format() and humanize() output utilities
│   ├── timezone.js     ← Timezone conversion (IANA + offset)
│   ├── locale.js       ← Multi-language support + built-in locales
│   └── range.js        ← range(), batch(), sort(), earliest(), latest()
├── dist/
│   └── flexdate.umd.js ← Browser/CDN build (self-contained, no bundler)
└── test/
    ├── index.test.js   ← Core parsing tests (50 cases)
    └── advanced.test.js← Locale, range, UMD, edge case tests (35 cases)
```

**Parser pipeline** (in `index.js`):
1. Type check → pass through Date/number directly
2. Extract time component (`at 3pm`, trailing time)
3. Try `parseRelative()` on the date part
4. Try `parseNatural()` on the date part
5. Apply time if found
6. Apply timezone if specified

---

## Making Changes

### For a bug fix
1. Write a failing test first (in the appropriate test file)
2. Fix the bug in the relevant `lib/` file
3. Confirm the test passes
4. Make sure all existing tests still pass: `npm test`

### For a new feature
1. Open a GitHub Issue first to discuss the design
2. Once agreed, implement in the smallest `lib/` file that makes sense
3. Add tests covering: normal usage, edge cases, and error cases
4. Update `index.d.ts` if the public API changes
5. Update `README.md` with usage examples
6. Add an entry to `CHANGELOG.md` under `[Unreleased]`

---

## Adding a New Locale

Locales live in `lib/locale.js` under `BUILTIN_LOCALES`. Each locale needs:

```js
{
  months:      [],  // 12 full month names, lowercase, index 0 = January
  monthsShort: [],  // 12 short names (3 chars preferred), lowercase
  days:        [],  // 7 weekday names, lowercase, index 0 = Sunday
  daysShort:   [],  // 7 short weekday names
  relative: {       // optional — common relative words
    today:     '',
    yesterday: '',
    tomorrow:  '',
  },
}
```

**Steps:**
1. Add the locale object to `BUILTIN_LOCALES` in `lib/locale.js`
2. Add test cases in `test/advanced.test.js` under `Locale Parsing`:
   ```js
   test('xx: 15 monthname 2025', () => {
     assertDate(flexDate.locale('15 monthname 2025', 'xx'), { year: 2025, month: 3, day: 15 });
   });
   test('xx: today-word', () => {
     const d = flexDate.locale('today-word', 'xx', { now: REF });
     assertDate(d, { year: 2025, month: 6, day: 15 });
   });
   ```
3. Add the locale to the table in `README.md`
4. Run `npm test`

Native speakers are especially welcome to contribute locales — machine-generated month names can be inaccurate.

---

## Adding a New Date Format

New formats belong in `lib/natural.js` (for structured/written formats) or `lib/relative.js` (for relative expressions).

**Guidelines:**
- Add the most specific pattern first (before fallbacks)
- Use a named regex match for clarity
- Add at least 3 test cases: typical input, edge case, boundary
- Ensure the new pattern does not break any existing tests
- Document the pattern with a comment: `// "D Month YYYY" e.g. "15 march 2025"`
- Watch for ReDoS: all quantifiers must be bounded (e.g. `\d{1,4}` not `\d+`)

---

## Running Tests

```bash
# All tests
npm test

# Core tests only
node test/index.test.js

# Advanced tests only
node test/advanced.test.js
```

Tests use Node's built-in `assert`-style helper — no test framework needed. A green run looks like:

```
  Results: 50 passed, 0 failed
  Results: 35 passed, 0 failed
```

All tests must pass before submitting a PR. No exceptions.

---

## Submitting a Pull Request

1. Ensure `npm test` passes with 0 failures
2. Keep PRs focused — one feature or fix per PR
3. Fill out the PR template completely
4. Reference any related issues: `Fixes #42`
5. Be patient — maintainers review PRs within 5 business days

### PR checklist

- [ ] Tests pass (`npm test`)
- [ ] New behavior has test coverage
- [ ] `index.d.ts` updated if public API changed
- [ ] `README.md` updated if usage changed
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] No new dependencies added

---

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

[optional body]

[optional footer: Fixes #123]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature or locale |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `refactor` | Code change without behavior change |
| `perf` | Performance improvement |
| `chore` | Tooling, CI, repo maintenance |

**Examples:**
```
feat(locale): add Korean (ko) locale
fix(natural): handle Feb 29 on non-leap years correctly
docs: add timezone examples to README
test(range): add edge case for same-day range
```

---

## Reporting Bugs

Use the GitHub Issue tracker. Please include:

- `flexdate` version (`npm list flexdate`)
- Node.js version (`node --version`)
- The exact input string that fails
- What you expected vs. what you got
- A minimal reproduction if possible:
  ```js
  const flexDate = require('flexdate');
  console.log(flexDate('YOUR INPUT HERE'));
  // Expected: Date(2025-03-15)
  // Got: null
  ```

---

## Requesting Features

Open a GitHub Issue with the label `enhancement`. Describe:

1. The date format or feature you want to support
2. Real-world examples of where you'd use it
3. Your proposed API (if it's a new method)

---

## Recognition

All contributors are listed in the GitHub contributors graph. Significant contributions (new locales, major features, bug fixes) will also be called out in `CHANGELOG.md`.

Thank you for making `flexdate` better! 🗓️
