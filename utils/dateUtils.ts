/**
 * Date Utilities - Handles timezone conversion for Brazilian timezone (UTC-3)
 */

const BRAZIL_TIMEZONE_OFFSET = -3; // UTC-3

/**
 * Get current date in Brazilian timezone (UTC-3)
 * Returns date string in format YYYY-MM-DD
 */
export function getBrazilDate(): string {
  // Calcula a data do calendário no fuso do Brasil (UTC-3),
  // independente do timezone do dispositivo.
  const brazilNow = new Date(Date.now() + (BRAZIL_TIMEZONE_OFFSET * 3600000));
  return brazilNow.toISOString().split('T')[0];
}

/**
 * Get current datetime in Brazilian timezone (UTC-3)
 * Returns ISO string
 */
export function getBrazilDateTime(): string {
  // Mantém timestamps em UTC para consistência no armazenamento (created_at)
  return new Date().toISOString();
}

/**
 * Convert a given Date (instant) to a YYYY-MM-DD string in Brazilian timezone (UTC-3)
 */
export function toBrazilDate(date: Date): string {
  const utcMs = date.getTime();
  const brazilMs = utcMs + (BRAZIL_TIMEZONE_OFFSET * 3600000);
  return new Date(brazilMs).toISOString().split('T')[0];
}

/**
 * Convert UTC date to Brazilian timezone display
 */
export function formatBrazilDate(utcDate: string): string {
  const date = new Date(utcDate);
  const utcTime = date.getTime();
  const brazilTime = new Date(utcTime + (BRAZIL_TIMEZONE_OFFSET * 3600000));
  
  return brazilTime.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Convert UTC datetime to Brazilian timezone display
 */
export function formatBrazilDateTime(utcDateTime: string): string {
  const date = new Date(utcDateTime);
  const utcTime = date.getTime();
  const brazilTime = new Date(utcTime + (BRAZIL_TIMEZONE_OFFSET * 3600000));
  
  return brazilTime.toLocaleString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get day of week in Portuguese for Brazilian timezone
 */
export function getBrazilDayOfWeek(utcDate?: string): string {
  const date = utcDate ? new Date(utcDate) : new Date();
  const utcTime = date.getTime();
  const brazilTime = new Date(utcTime + (BRAZIL_TIMEZONE_OFFSET * 3600000));
  
  return brazilTime.toLocaleDateString('pt-BR', { weekday: 'long' });
}

/**
 * Check if a date is today in Brazilian timezone
 */
export function isTodayBrazil(dateString: string): boolean {
  return dateString === getBrazilDate();
}
