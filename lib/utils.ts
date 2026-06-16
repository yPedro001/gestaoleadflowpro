import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  try {
    return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  try {
    return format(parseISO(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatRelativeDate(date: string | null | undefined): string {
  if (!date) return '—';
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: ptBR });
  } catch {
    return '—';
  }
}

export function isExpiringSoon(expiresAt: string | null, days = 7): boolean {
  if (!expiresAt) return false;
  const exp = parseISO(expiresAt);
  const now = new Date();
  const deadline = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return exp > now && exp <= deadline;
}

export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return parseISO(expiresAt) < new Date();
}
