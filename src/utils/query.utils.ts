import { PaginationParams } from "@/types/common";

export function calculatePagination(params: PaginationParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, Math.min(params.limit ?? 10, 100));
  const skip = (page - 1) * limit;

  return { skip, take: limit, page };
}

export function removeFields<D, T extends Record<string, D>>(
  data: T,
  fieldsToRemove?: string[]
): Partial<T> {
  if (!fieldsToRemove?.length) return data;
  
  const result = { ...data };
  fieldsToRemove.forEach(field => delete result[field]);
  return result;
}
