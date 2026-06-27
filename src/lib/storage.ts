/**
 * @file AES-GCM Encrypted Local Storage
 * @author Davey Wong (wgwcko@gmail.com)
 * @license Apache-2.0
 */

const AK = '@juezhao_accounts';
const DK = '@juezhao_derive';

export interface StoredAccount {
  id: string;
  name: string;
  issuer: string | null;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  period: number;
  createdAt: string;
}

export function genId(): string {
  return `jz_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function getAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem(AK) || '[]'); } catch { return []; }
}

export function saveAccounts(a: StoredAccount[]): void {
  localStorage.setItem(AK, JSON.stringify(a));
}

async function deriveKey(): Promise<CryptoKey> {
  let m = localStorage.getItem(DK);
  if (!m) {
    const r = crypto.getRandomValues(new Uint8Array(32));
    m = btoa(Array.from(r, c => String.fromCharCode(c)).join(''));
    localStorage.setItem(DK, m);
  }
  const enc = new TextEncoder();
  const kd = await crypto.subtle.importKey('raw', enc.encode(m + '@jz:v1'), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('jz-salt'), iterations: 600000, hash: 'SHA-256' }, kd, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encSecret(id: string, secret: string): Promise<void> {
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(secret)));
  const toB64 = (u: Uint8Array) => btoa(Array.from(u, c => String.fromCharCode(c)).join(''));
  localStorage.setItem(`@jz_sec_${id}`, `${toB64(iv)}.${toB64(ct)}`);
}

export async function decSecret(id: string): Promise<string | null> {
  try {
    const raw = localStorage.getItem(`@jz_sec_${id}`);
    if (!raw) return null;
    const [ivB, ctB] = raw.split('.');
    const fromB64 = (s: string) => { const d = atob(s); return new Uint8Array(d.length).map((_, i) => d.charCodeAt(i)); };
    const key = await deriveKey();
    const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(ivB) }, key, fromB64(ctB).buffer as ArrayBuffer);
    return new TextDecoder().decode(dec);
  } catch { return null; }
}

export function delSecret(id: string): void {
  localStorage.removeItem(`@jz_sec_${id}`);
}
