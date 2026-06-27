/**
 * @file TOTP Core Library
 * @description RFC 6238 TOTP with pure Web Crypto API (no external deps)
 * @author Davey Wong (wgwcko@gmail.com)
 * @license Apache-2.0
 */

// ── Base32 (RFC 4648) ──────────────────────────────────────────────────

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function b32decode(s: string): Uint8Array {
  const clean = s.replace(/[= \t\r\n]/g, '').toUpperCase();
  const buf: number[] = [];
  let bits = 0, value = 0;
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx === -1) throw new Error(`Invalid base32 char: ${ch}`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { buf.push((value >> (bits - 8)) & 0xff); bits -= 8; }
  }
  return new Uint8Array(buf);
}

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

// ── HMAC ─────────────────────────────────────────────────────────────────

async function hmac(key: Uint8Array, msg: Uint8Array, algo: 'SHA-1' | 'SHA-256' | 'SHA-512') {
  const k = await crypto.subtle.importKey('raw', key.buffer.slice(0) as ArrayBuffer, { name: 'HMAC', hash: algo }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, msg.buffer.slice(0) as ArrayBuffer));
}

// ── TOTP (RFC 6238) ──────────────────────────────────────────────────────

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

const HM = { SHA1: 'SHA-1', SHA256: 'SHA-256', SHA512: 'SHA-512' } as const;

export async function generateTOTP(secret: string, opts: TOTPOptions = {}): Promise<{ code: string; remainingSeconds: number }> {
  const { algorithm = 'SHA1', digits = 6, period = 30, timestamp = Date.now() } = opts;
  if (!secret?.trim()) throw new Error('Secret cannot be empty');
  if (![6, 8].includes(digits)) throw new Error('Digits must be 6 or 8');
  if (![30, 60].includes(period)) throw new Error('Period must be 30 or 60');

  const clean = secret.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z2-7]+=*$/.test(clean)) throw new Error('Invalid base32 secret');

  const ha = HM[algorithm];
  if (!ha) throw new Error(`Unsupported algorithm: ${algorithm}`);

  let counter = Math.floor(timestamp / 1000 / period);
  const cb = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) { cb[i] = counter & 0xff; counter >>>= 8; }

  const hs = await hmac(b32decode(clean), cb, ha);
  const off = hs[hs.length - 1] & 0xf;
  const code = String(((hs[off] & 0x7f) << 24 | (hs[off + 1] & 0xff) << 16 | (hs[off + 2] & 0xff) << 8 | (hs[off + 3] & 0xff)) % Math.pow(10, digits)).padStart(digits, '0');

  const now = Math.floor(timestamp / 1000);
  return { code, remainingSeconds: period - (now % period) };
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
    const algo = (url.searchParams.get('algorithm') || 'SHA1').toUpperCase();
    return {
      type: 'totp', label,
      issuer: url.searchParams.get('issuer') || issuerFromPath || '',
      secret: secret.toUpperCase().replace(/\s/g, ''),
      algorithm: ['SHA1', 'SHA256', 'SHA512'].includes(algo) ? algo as any : 'SHA1',
      digits: [6, 8].includes(parseInt(url.searchParams.get('digits') || '6')) ? parseInt(url.searchParams.get('digits') || '6') : 6,
      period: [30, 60].includes(parseInt(url.searchParams.get('period') || '30')) ? parseInt(url.searchParams.get('period') || '30') : 30,
    };
  } catch { return null; }
}

export function generateSecret(length = 20): string {
  const b = new Uint8Array(length);
  crypto.getRandomValues(b);
  return b32encode(b);
}

export function validateSecret(secret: string): boolean {
  const c = secret.replace(/\s/g, '').toUpperCase();
  return /^[A-Z2-7]+=*$/.test(c) && c.replace(/=+$/, '').length >= 16;
}
