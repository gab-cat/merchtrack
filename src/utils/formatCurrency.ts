export function formatCurrency(amount: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}