import { Prisma } from '@prisma/client';

type CurrencyInput = number | Prisma.Decimal;

/**
 * Formats a given monetary amount into a currency string.
 *
 * This function accepts an amount as either a number or a Prisma.Decimal. If the amount
 * is a Prisma.Decimal, it is converted to a number before formatting. The number is then
 * formatted as a currency string using the 'en-US' locale and the specified currency code,
 * which defaults to 'PHP'.
 *
 * @param amount - The monetary amount to format, as a number or a Prisma.Decimal.
 * @param currency - The currency code to use for formatting (default is 'PHP').
 * @returns A string representing the formatted currency amount.
 *
 * @example
 * // Returns "$1,000.00" for USD formatting:
 * formatCurrency(1000, 'USD');
 *
 * @example
 * // If amount is a Prisma.Decimal instance, it is converted to a number before formatting:
 * formatCurrency(new Prisma.Decimal('2500.50'));
 */
export function formatCurrency(amount: CurrencyInput, currency = 'PHP') {
  if (amount === null || amount === undefined) {
    throw new Error('Amount is required');
  }

  const numericAmount = amount instanceof Prisma.Decimal ? amount.toNumber() : amount;
  
  if (isNaN(numericAmount)) {
    throw new Error('Invalid numeric amount');
  }

  if (numericAmount < 0) {
    throw new Error('Amount cannot be negative');
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}