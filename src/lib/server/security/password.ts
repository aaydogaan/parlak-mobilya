import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";

function scryptAsync(
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;

/**
 * Enterprise Password Hashing using RFC 7914 Memory-Hard Scrypt (Node 22 built-in).
 * Formatted as: scrypt:N:r:p:saltHex:hashHex
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 32 * 1024 * 1024,
  });

  return `scrypt:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}:${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Constant-time password verification to prevent side-channel timing attacks.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash || typeof password !== "string" || typeof storedHash !== "string") {
    return false;
  }

  const parts = storedHash.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
  const N = parseInt(nStr, 10);
  const r = parseInt(rStr, 10);
  const p = parseInt(pStr, 10);

  if (isNaN(N) || isNaN(r) || isNaN(p) || !saltHex || !hashHex) {
    return false;
  }

  try {
    const derivedKey = (await scryptAsync(password, saltHex, hashHex.length / 2, {
      N,
      r,
      p,
      maxmem: 64 * 1024 * 1024,
    })) as Buffer;

    const storedBuffer = Buffer.from(hashHex, "hex");
    if (derivedKey.length !== storedBuffer.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Strong password policy validator.
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Şifre alanı boş bırakılamaz." };
  }

  if (password.length < 8) {
    return { valid: false, message: "Şifre en az 8 karakter uzunluğunda olmalıdır." };
  }

  if (password.length > 128) {
    return { valid: false, message: "Şifre en fazla 128 karakter olabilir." };
  }

  const hasLetter = /[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { valid: false, message: "Şifre en az bir harf ve bir rakam içermelidir." };
  }

  return { valid: true };
}
