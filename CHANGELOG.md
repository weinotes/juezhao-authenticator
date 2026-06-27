# Changelog

> Author: Davey Wong <wgwcko@gmail.com>

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-06-28

### Added

- RFC 6238 TOTP code generation (SHA1 / SHA256 / SHA512)
- 6-digit and 8-digit code support
- 30s and 60s refresh period support
- QR code scanning via otpauth:// URI (BarcodeDetector API)
- Manual account entry with Base32 secret input
- AES-256-GCM encrypted local storage (PBKDF2 key derivation)
- Dark theme UI with progress bar countdown
- Auto-refresh TOTP codes every second
- PWA support with manifest
- CI/CD workflows (type check + unit tests + build)
- Unit tests (16 test cases)
- Full open source compliance kit (LICENSE, CODE_OF_CONDUCT, etc.)

[0.1.0]: https://github.com/weinotes/juezhao-authenticator/releases/tag/v0.1.0
