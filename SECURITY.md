# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Active  |

Only the latest minor release of the current major version receives security patches.

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security issue in `flexdate`, please report it responsibly:

1. **Email**: danuz.dev@gmail.com
2. **Subject**: `[flexdate] Security Vulnerability Report`
3. **PGP**: If you need to send sensitive details, request our PGP key first.

### What to include

- A clear description of the vulnerability
- Steps to reproduce the issue
- The potential impact (what an attacker could do)
- Your suggested fix (optional but appreciated)

### What to expect

| Timeline | Action |
|----------|--------|
| **24 hours** | Acknowledgement of your report |
| **72 hours** | Initial assessment and severity classification |
| **7 days** | Patch in development (for confirmed vulnerabilities) |
| **14 days** | Patch released and CVE filed if applicable |
| **30 days** | Public disclosure (coordinated with reporter) |

We follow [responsible disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure). We will credit you in the release notes unless you prefer to remain anonymous.

---

## Scope

### In scope
- ReDoS (Regular Expression Denial of Service) via malicious date strings
- Prototype pollution via crafted inputs
- Incorrect parsing that could lead to authentication/authorization bypass
- Timezone manipulation leading to incorrect access control decisions

### Out of scope
- Issues in dependencies (we have none, but noted for future)
- Vulnerabilities in Node.js itself
- Issues in your own application code that uses `flexdate`
- Theoretical vulnerabilities with no practical exploit

---

## Security Design Notes

`flexdate` is designed with security in mind:

- **Zero dependencies** — no supply chain attack surface
- **No `eval`** — date strings are never executed as code
- **Input validation** — all inputs are type-checked before processing
- **ReDoS mitigations** — regexes are bounded and tested against long inputs
- **No network access** — purely synchronous, local computation
- **No file system access** — safe for edge/serverless environments

---

## Known Security Considerations

### ReDoS

All regular expressions in `flexdate` are designed to fail fast on non-matching input. If you discover a pattern that causes exponential backtracking, please report it immediately — this is our highest-priority vulnerability class.

### Prototype Pollution

The `options` object passed to `flexDate()` is never merged into a shared object. Custom locale objects registered via `registerLocale()` are stored in a `Map`, not plain objects, to prevent prototype pollution.

---

## Bug Bounty

We do not currently operate a paid bug bounty program. However, we will:
- Credit all responsible disclosures in the changelog
- Provide a letter of acknowledgement for your portfolio on request
