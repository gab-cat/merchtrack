import { format } from "date-fns";

/**
 * Formats a number as Philippine Pesos (PHP) using the locale-specific currency format.
 *
 * This function uses the Intl.NumberFormat API with the 'en-PH' locale to convert the provided
 * numeric amount into a string formatted according to Philippine currency conventions.
 *
 * @param amount - The numeric value to be formatted.
 * @returns A string representing the formatted currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
}

/**
 * Formats the given date into a localized string using the "en-PH" locale.
 *
 * This function accepts a date as either a Date object or a string, converts it to a Date,
 * and formats it to include the full year, long month name, numeric day, and two-digit hour and minute.
 *
 * @param date - A Date object or a string representing the date to format.
 * @returns A string representing the formatted date.
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

/**
 * Converts a date input to a human-readable string format.
 *
 * This function accepts a date as either a Date object or a valid date string, converts it to a Date object,
 * and formats it using the "MMM d, yyyy HH:mm:ss" pattern. The formatting is performed with the date-fns `format` function.
 *
 * @param date - The date to be formatted. Can be a Date object or a valid date string.
 * @returns The formatted date string.
 */
export function prettyFormatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy HH:mm:ss");
}