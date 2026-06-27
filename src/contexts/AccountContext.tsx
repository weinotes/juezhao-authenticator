/**
 * @file Account State Context
 * @author Davey Wong (wgwcko@gmail.com)
 * @license Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { StoredAccount, getAccounts, saveAccounts, generateId, encryptSecret, decryptSecret, deleteSecret } from '../lib/storage';
import { generateTOTP, parseOtpauthUri, validateSecret } from '../lib/totp';

export interface AccountWithCode extends StoredAccount {
  code: string;
  remainingSeconds: number;
}

interface CtxType {
  accounts: StoredAccount[];
  accountsWithCodes: AccountWithCode[];
  isLoading: boolean;
  addAccount: (d: { name: string; issuer: string | null; secret: string; algorithm: 'SHA1' | 'SHA256' | 'SHA512'; digits: number; period: number }) => Promise<void>;
  addAccountFromUri: (uri: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

const Ctx = createContext<CtxType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [codes, setCodes] = useState<AccountWithCode[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<StoredAccount[]>([]);

  useEffect(() => { ref.current = accounts; }, [accounts]);

  useEffect(() => {
    (async () => {
      const stored = await getAccounts();
      setAccounts(stored);
      setLoading(false);
    })();
  }, []);

  // 每秒刷新 TOTP 验证码
  useEffect(() => {
    const tick = async () => {
      const cur = ref.current;
      if (!cur.length) { setCodes([]); return; }
      const r = await Promise.all(cur.map(async (a) => {
        try {
          const s = await decryptSecret(a.id);
          if (!s) throw new Error('secret missing');
          const { code, remainingSeconds } = await generateTOTP(s, { algorithm: a.algorithm, digits: a.digits, period: a.period });
          return { ...a, code, remainingSeconds };
        } catch {
          return { ...a, code: '------', remainingSeconds: 0 };
        }
      }));
      setCodes(r);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const addAccount = useCallback(async (d: { name: string; issuer: string | null; secret: string; algorithm: 'SHA1' | 'SHA256' | 'SHA512'; digits: number; period: number }) => {
    if (!validateSecret(d.secret)) throw new Error('Invalid base32 secret');
    const id = generateId();
    const a: StoredAccount = { id, name: d.name, issuer: d.issuer, algorithm: d.algorithm, digits: d.digits, period: d.period, createdAt: new Date().toISOString() };
    await encryptSecret(id, d.secret.replace(/\s/g, '').toUpperCase());
    const u = [a, ...ref.current];
    setAccounts(u);
    await saveAccounts(u);
  }, []);

  const addAccountFromUri = useCallback(async (uri: string) => {
    const p = parseOtpauthUri(uri);
    if (!p) throw new Error('Invalid TOTP QR code');
    await addAccount({ name: p.label, issuer: p.issuer || null, secret: p.secret, algorithm: p.algorithm, digits: p.digits, period: p.period });
  }, [addAccount]);

  const deleteAccount = useCallback(async (id: string) => {
    await deleteSecret(id);
    const u = ref.current.filter((a) => a.id !== id);
    setAccounts(u);
    await saveAccounts(u);
  }, []);

  return (
    <Ctx.Provider value={{ accounts, accountsWithCodes: codes, isLoading: loading, addAccount, addAccountFromUri, deleteAccount }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAccounts() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAccounts must be inside AccountProvider');
  return c;
}
