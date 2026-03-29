# Changelog

All notable changes to `flexdate` will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2025-03-28

### Added
- Core parser: ordinals, natural language, ISO, slash/dash formats, unix timestamps
- Relative dates: `yesterday`, `today`, `tomorrow`, `3 days ago`, `in 2 weeks`, `next friday`, etc.
- Time parsing: `at 3pm`, `at noon`, `at midnight`, combined date+time
- Timezone support via IANA names and UTC offset strings
- Utility methods: `format`, `humanize`, `diff`, `add`, `subtract`, `isBefore`, `isAfter`,
  `isSameDay`, `startOf`, `endOf`, `isValid`, `parse`, `try`
- Locale support: `fr`, `de`, `es`, `pt`, `it`, `nl`, `ru`, `zh`, `ja`, `ar` built-in,
  plus `registerLocale()` for custom locales
- Range & batch utilities: `range`, `batch`, `sort`, `earliest`, `latest`, `inRange`
- CJS (`index.js`), ESM (`index.mjs`), UMD (`dist/flexdate.umd.js`) builds
- Full TypeScript definitions (`index.d.ts`) — no `@types` package needed
- Zero dependencies
- Node.js 12+, Vercel, Netlify, Cloudflare Workers, Deno, browsers, React Native
