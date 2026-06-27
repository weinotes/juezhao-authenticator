# Changelog

> Author: Davey Wong <wgwcko@gmail.com>

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-06-28

### Changed

- **BREAKING**: Rewrote framework from Next.js (web PWA) to Expo React Native
- TOTP core: switched from pure Web Crypto API to otplib (HMAC crypto plugin)
- Secure storage: replaced localStorage + AES-GCM with expo-secure-store
  (iOS Keychain / Android Keystore)

### Added

- Android APK build workflow (Expo prebuild + Gradle assembleDebug)
- GitHub Release on tag with APK upload

### Removed

- Next.js web app, PWA manifest, CSS globals, BarcodeDetector scanner

## [0.1.0] — 2026-06-28

### Added

- RFC 6238 TOTP code generation (SHA1 / SHA256 / SHA512)
- 6-digit and 8-digit code support
- 30s and 60s refresh period support
- QR code scanning via otpauth:// URI
- Manual account entry with Base32 secret input
- Dark theme UI with progress bar countdown
- Auto-refresh TOTP codes every second
- Unit tests (16 test cases)
- Full open source compliance kit (LICENSE, CODE_OF_CONDUCT, etc.)

[0.2.0]: https://github.com/weinotes/juezhao-authenticator/releases/tag/v0.2.0
[0.1.0]: https://github.com/weinotes/juezhao-authenticator/releases/tag/v0.1.0
