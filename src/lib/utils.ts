import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export const formatDateTime = (date: Date | string) => 
  format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });

export const formatDate = (date: Date | string) => 
  format(new Date(date), 'EEEE, dd/MM/yyyy', { locale: vi });