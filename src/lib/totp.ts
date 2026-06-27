/**
 * @file TOTP Core Library
 * @description RFC 6238 TOTP using otplib
 * @author Davey Wong (wgwcko@gmail.com)
 * @copyright 2026 Davey Wong <wgwcko@gmail.com>
 * @license Apache-2.0
 */

import { Authenticator, HashAlgorithms } from '@otplib/core';
import { createDigest, createRandomBytes } from '@otplib/plugin-crypto';
import { keyDecoder, keyEncoder } from '@otplib/plugin-thirty-two';

export interface TOTPOptions {
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: number;
  period?: number;
  timestamp?: number;
}

export interface OtpauthUri {
  type: 'totp';
  label: string;
  issuer: string;
  secret: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  period: number;
}

/* ── Base32 (RFC 4648) ───────────────────────────────────────────── */

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function b32encode(bytes: Uint8Array): string {
  let r = '', buf = 0, bits = 0;
  for (let i = 0; i < bytes.length; i++) {
    buf = (buf << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) { r += B32[(buf >> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) r += B32[(buf << (5 - bits)) & 31];
  return r;
}

/* ── TOTP ────────────────────────────────────────────────────────── */

function createAuthenticator(algorithm: string, digits: number, period: number): Authenticator {
  return new Authenticator({
    createDigest,
    createRandomBytes,
    keyDecoder,
    keyEncoder,
    algorithm: algorithm.toLowerCase() as HashAlgorithms,
    digits,
    step: period,
    epoch: 0,
    window: 0,
  });
}

export async function generateTOTP(
  secret: string,
  options: TOTPOptions = {}
): Promise<{ code: string; remainingSeconds: number }> {
  const { algorithm = 'SHA1', digits = 6, period = 30, timestamp = Date.now() } = options;
  if (!secret?.trim()) throw new Error('Secret cannot be empty');
  if (digits !== 6 && digits !== 8) throw new Error('Digits must be 6 or 8');
  if (period !== 30 && period !== 60) throw new Error('Period must be 30 or 60');

  const clean = secret.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z2-7]+=*$/.test(clean)) throw new Error('Invalid base32 secret');

  const totp = createAuthenticator(algorithm, digits, period);
  const code = totp.generate(clean);

  const nowSec = Math.floor(timestamp / 1000);
  return { code, remainingSeconds: period - (nowSec % period) };
}

export function parseOtpauthUri(uri: string): OtpauthUri | null {
  try {
    if (!uri.startsWith('otpauth://')) return null;
    const url = new URL(uri);
    if (url.hostname !== 'totp') return null;

    const path = decodeURIComponent(url.pathname.slice(1));
    const parts = path.split(':');
    const label = parts.length > 1 ? parts[1].trim() : parts[0].trim();
    const issuerFromPath = parts.length > 1 ? parts[0].trim() : '';
    const secret = url.searchParams.get('secret');
    if (!secret) return null;

    const a = (url.searchParams.get('algorithm') || 'SHA1').toUpperCase();
    const algorithm = ['SHA1', 'SHA256', 'SHA512'].includes(a) ? a as 'SHA1'|'SHA256'|'SHA512' : 'SHA1';
    const d = parseInt(url.searchParams.get('digits') || '6');
    const digits = (d === 6 || d === 8) ? d : 6;
    const p = parseInt(url.searchParams.get('period') || '30');
    const period = (p === 30 || p === 60) ? p : 30;

    return {
      type: 'totp',
      label,
      issuer: url.searchParams.get('issuer') || issuerFromPath || '',
      secret: secret.toUpperCase().replace(/\s/g, ''),
      algorithm,
      digits,
      period,
    };
  } catch { return null; }
}

export function generateSecret(length = 20): string {
  const bytes = new Uint8Array(length);
  // Use global crypto.getRandomValues (polyfilled by expo-crypto in RN)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  }
  return b32encode(bytes);
}

export function validateSecret(secret: string): boolean {
  const c = secret.replace(/\s/g, '').toUpperCase();
  return /^[A-Z2-7]+=*$/.test(c) && c.replace(/=+$/, '').length >= 16;
}
