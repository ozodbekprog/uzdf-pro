import bcrypt from "bcryptjs";

const ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
