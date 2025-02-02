import { Prisma } from '@prisma/client';

type CurrencyInput = number | Prisma.Decimal;

export function formatCurrency(amount: CurrencyInput, currency = 'PHP') {
  const numericAmount = amount instanceof Prisma.Decimal ? amount.toNumber() : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(numericAmount);
}