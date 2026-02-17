import * as Crypto from 'expo-crypto';

// Gera UUID v4 de forma síncrona; usa fallback caso randomUUID não exista
export const generateUUID = (): string => {
  if (typeof (Crypto as any).randomUUID === 'function') {
    return (Crypto as any).randomUUID();
  }

  const bytes = Crypto.getRandomBytes(16);
  // Ajusta para v4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const hex = Array.from(bytes).map(toHex).join('');
  return (
    hex.slice(0, 8) +
    '-' +
    hex.slice(8, 12) +
    '-' +
    hex.slice(12, 16) +
    '-' +
    hex.slice(16, 20) +
    '-' +
    hex.slice(20)
  );
};

// Conveniência para garantir UUID
export const ensureUUID = (id?: string | null) => id || generateUUID();

