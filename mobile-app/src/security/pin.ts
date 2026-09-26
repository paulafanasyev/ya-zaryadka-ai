import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

/*
 * Родительский PIN. Хранится только хеш (соль + многократный SHA-256)
 * в Android Keystore через expo-secure-store. После 5 ошибок вход блокируется:
 * 30 с, затем время удваивается до 15 минут. Счётчик ошибок тоже в SecureStore.
 */
const PIN_KEY = 'yz_parent_pin_v2';
const LOCK_KEY = 'yz_parent_lock_v1';
const ITERATIONS = 400;
const FREE_ATTEMPTS = 5;
const BASE_LOCK_MS = 30 * 1000;
const MAX_LOCK_MS = 15 * 60 * 1000;

interface PinRecord { v: 2; salt: string; hash: string; iter: number; }
interface LockRecord { fails: number; until: number; }
export interface VerifyResult { ok: boolean; lockedMs: number; left: number; }

const OPTS: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

function toHex(bytes: Uint8Array) {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

async function derive(pin: string, salt: string, iter: number) {
  let h = salt + ':' + pin;
  for (let i = 0; i < iter; i++) {
    h = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + h);
  }
  return h;
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(key, OPTS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    return null;
  }
}

export async function hasPin() {
  const rec = await readJson<PinRecord>(PIN_KEY);
  return !!(rec && rec.salt && rec.hash);
}

export async function savePin(pin: string) {
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be 4 digits');
  const salt = toHex(Crypto.getRandomBytes(16));
  const hash = await derive(pin, salt, ITERATIONS);
  const rec: PinRecord = { v: 2, salt, hash, iter: ITERATIONS };
  await SecureStore.setItemAsync(PIN_KEY, JSON.stringify(rec), OPTS);
  await SecureStore.deleteItemAsync(LOCK_KEY, OPTS);
}

export async function verifyPin(pin: string): Promise<VerifyResult> {
  const now = Date.now();
  const lock = (await readJson<LockRecord>(LOCK_KEY)) || { fails: 0, until: 0 };
  if (lock.until > now) return { ok: false, lockedMs: lock.until - now, left: 0 };
  const rec = await readJson<PinRecord>(PIN_KEY);
  if (!rec) return { ok: false, lockedMs: 0, left: 0 };
  const hash = await derive(pin, rec.salt, rec.iter || ITERATIONS);
  if (safeEqual(hash, rec.hash)) {
    await SecureStore.deleteItemAsync(LOCK_KEY, OPTS);
    return { ok: true, lockedMs: 0, left: FREE_ATTEMPTS };
  }
  const fails = (lock.fails || 0) + 1;
  const until = fails >= FREE_ATTEMPTS ? now + Math.min(MAX_LOCK_MS, BASE_LOCK_MS * Math.pow(2, fails - FREE_ATTEMPTS)) : 0;
  await SecureStore.setItemAsync(LOCK_KEY, JSON.stringify({ fails, until }), OPTS);
  return { ok: false, lockedMs: until ? until - now : 0, left: Math.max(0, FREE_ATTEMPTS - fails) };
}

export async function clearPinData() {
  await SecureStore.deleteItemAsync(PIN_KEY, OPTS);
  await SecureStore.deleteItemAsync(LOCK_KEY, OPTS);
}
