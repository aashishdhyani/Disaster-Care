import { type ClassValue, clsx } from "clsx";

/**
 * Merge conditional class names. Thin wrapper around clsx so we have a
 * single import path if we ever want to add tailwind-merge later.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
