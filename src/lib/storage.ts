/**
 * @file Secure TOTP Secret Storage
 * @description SecureStore + AsyncStorage for accounts
 * @author Davey Wong (wgwcko@gmail.com)
 * @copyright 2026 Davey Wong <wgwcko@gmail.com>
 * @license Apache-2.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = '@juezhao_accounts';
const SECURE_PREFIX = 'juezhao_secret_';

export interface StoredAccount {
  id: string;
  name: string;
  issuer: string | null;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  period: number;
  createdAt: string;
}

export function generateId(): string {
  return `jz_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getSecureKey(id: string): string {
  return `${SECURE_PREFIX}${id}`;
}

// ─── Account Metadata (AsyncStorage) ───────────────────────────

export async function getAccounts(): Promise<StoredAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveAccounts(accounts: StoredAccount[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

// ─── Secrets (SecureStore — iOS Keychain / Android Keystore) ──

export async function encryptSecret(id: string, secret: string): Promise<void> {
  await SecureStore.setItemAsync(getSecureKey(id), secret, {
    keychainService: 'com.juezhao.authenticator.secrets',
  });
}

export async function decryptSecret(id: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(getSecureKey(id), {
      keychainService: 'com.juezhao.authenticator.secrets',
    });
  } catch {
    return null;
  }
}

export async function deleteSecret(id: string): Promise<void> {
  await SecureStore.deleteItemAsync(getSecureKey(id), {
    keychainService: 'com.juezhao.authenticator.secrets',
  });
}
