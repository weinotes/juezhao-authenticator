# Security Policy

## Reporting a Vulnerability

We take the security of JueZhao Authenticator seriously.
TOTP secrets are sensitive credentials and must be protected.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to:
- **Davey Wong** — wgwcko@gmail.com

We will acknowledge receipt within 48 hours and provide an estimated
timeline for a fix.

## What to Include

- Type of issue (e.g., buffer overflow, SQL injection, cryptographic weakness)
- Full paths of source file(s) related to the manifestation
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue

## Encryption

All secrets are encrypted with AES-256-GCM before being stored in localStorage.
The encryption key is derived via PBKDF2 with 600,000 iterations.
We do not transmit or store secrets on any server.
