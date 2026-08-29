import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/**
 * Hash de senha com scrypt (Node built-in). Escolhido em vez de argon2/bcrypt
 * para evitar dependência nativa — parâmetros seguem a recomendação OWASP
 * (N=2^16, r=8, p=1 é o padrão do Node para scrypt com cost 16384; elevamos
 * o keylen para 64 bytes).
 */
const KEYLEN = 64;
const SALT_BYTES = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1]!, "base64");
  const expected = Buffer.from(parts[2]!, "base64");
  const derived = await scrypt(password, salt, expected.length);
  // Comparação em tempo constante.
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
