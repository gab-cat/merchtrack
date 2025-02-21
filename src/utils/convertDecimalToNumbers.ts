import { Prisma } from "@prisma/client";

export function convertDecimalToNumber(obj: Record<string, unknown>) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (obj[key] instanceof Prisma.Decimal) {
        obj[key] = obj[key].toNumber();
      } else if (typeof obj[key] === 'object') {
        convertDecimalToNumber(obj[key] as Record<string, unknown>);
      }
    }
  }
  return obj;
}
  