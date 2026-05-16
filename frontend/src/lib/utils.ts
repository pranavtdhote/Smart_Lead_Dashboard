import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes safely.
 * Prevents class conflicts when overriding default component styles.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
