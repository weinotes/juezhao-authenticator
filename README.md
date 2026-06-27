# JueZhao Authenticator

> RFC 6238 compliant TOTP authenticator — pure browser, zero server dependency.

[简体中文](README.zh-CN.md) | English

## Features

- **TOTP Code Generation** — RFC 6238 compliant
- **Multiple Algorithms** — SHA1 / SHA256 / SHA512
- **Flexible Digits** — 6-digit or 8-digit codes
- **Customizable Period** — 30s or 60s refresh interval
- **QR Scan** — Import accounts via `otpauth://` URI (BarcodeDetector API)
- **Manual Entry** — Add accounts with Base32 secret keys
- **Secure Storage** — AES-256-GCM encrypted local storage (PBKDF2, 600K iterations)
- **Dark Theme** — Eye-friendly dark UI with progress bar countdown
- **Auto-Refresh** — Codes update every second
- **PWA Ready** — Install as a standalone app

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Crypto | Web Crypto API (zero npm crypto deps) |
| Storage | localStorage + AES-256-GCM |
| Package Manager | pnpm |
| CI/CD | GitHub Actions |

## Quick Start

```bash
pnpm install
pnpm dev        # Start dev server at http://localhost:3000
pnpm type-check # Run TypeScript check
pnpm test       # Run unit tests
pnpm build      # Production build
```

## Security

- All TOTP secrets are encrypted with **AES-256-GCM** before being stored in `localStorage`
- The encryption key is derived using **PBKDF2** with **600,000 iterations**
- **No data is transmitted** to any server — fully offline operation
- The app requires **no network permissions**

## Project Structure

```
src/
├── lib/
│   ├── totp.ts      # RFC 6238 TOTP core (pure Web Crypto API)
│   ├── storage.ts   # AES-256-GCM encrypted storage
│   └── theme.ts     # Dark theme tokens
├── hooks/
│   └── useAccounts.tsx  # Account state management
└── app/
    ├── page.tsx         # Home — account list + TOTP codes
    ├── scan/page.tsx    # QR code scanner
    └── add-manual/page.tsx  # Manual account entry
```

## License

Apache 2.0 — see [LICENSE](LICENSE).

Author: **Davey Wong** [wgwcko@gmail.com]
