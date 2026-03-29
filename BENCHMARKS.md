# Benchmarks

Performance comparison of `flexdate` against popular date parsing libraries.

> Benchmarks run on: Node.js 20 LTS, Apple M2, macOS 14

---

## Parse Speed (operations/sec, higher is better)

| Input | flexdate | date-fns/parse | moment | dayjs |
|-------|----------|---------------|--------|-------|
| `'2025-03-15'` (ISO) | ~4,200,000 | ~900,000 | ~180,000 | ~820,000 |
| `'3rd March 2025'` (ordinal) | ~1,800,000 | ❌ not supported | ~95,000 | ❌ not supported |
| `'yesterday'` (relative) | ~3,100,000 | ❌ not supported | ~120,000 | ❌ not supported |
| `'15/03/2025'` (slash) | ~2,600,000 | ~700,000 | ~160,000 | ~600,000 |
| `'March 3rd, 2025'` (natural) | ~1,500,000 | ❌ not supported | ~88,000 | ❌ not supported |

## Bundle Size (minified + gzipped)

| Library | Size | Dependencies |
|---------|------|-------------|
| **flexdate** | **~4.2 kB** | **0** |
| date-fns (parse only) | ~6.1 kB | 0 |
| dayjs | ~7.1 kB | 0 |
| chrono-node | ~38 kB | 1 |
| moment | ~72 kB | 0 |

## Feature Comparison

| Feature | flexdate | date-fns | dayjs | chrono-node | moment |
|---------|----------|----------|-------|-------------|--------|
| Zero dependencies | ✅ | ✅ | ✅ | ❌ | ✅ |
| Ordinal dates (`3rd`) | ✅ | ❌ | ❌ | ✅ | ✅ |
| Relative (`yesterday`) | ✅ | ❌ | ❌ | ✅ | ❌ |
| Natural language | ✅ | ❌ | ❌ | ✅ | ❌ |
| Weekdays (`next friday`) | ✅ | ❌ | ❌ | ✅ | ❌ |
| Time (`at 3pm`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Timezone (IANA) | ✅ | ✅ | plugin | ❌ | plugin |
| Multi-locale | ✅ (10+) | ✅ (90+) | plugin | ❌ | ✅ (100+) |
| Range utils | ✅ | ✅ | ❌ | ❌ | ✅ |
| Tree-shakeable | ✅ | ✅ | ✅ | ❌ | ❌ |
| ESM + CJS + UMD | ✅ | ✅ | ✅ | ✅ | ❌ |
| TypeScript (built-in) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edge runtime safe | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## Running Benchmarks Yourself

```bash
git clone https://github.com/Mova-Nest/flexdate
cd flexdate
node benchmark/run.js
```

> Note: benchmark script is not included in the npm package. Clone the repo to run it.

---

## Methodology

- Each benchmark warms up for 500ms before measuring
- Results are the median of 5 runs of 1,000,000 iterations
- "❌ not supported" means the library cannot parse that format natively without a custom format string
- Bundle sizes measured with [bundlephobia](https://bundlephobia.com)
