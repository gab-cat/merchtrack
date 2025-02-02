import { PaginationParams } from "@/types/common";

/**
 * Calculates pagination details based on the provided parameters.
 *
 * This function computes the pagination values by:
 * - Ensuring the page number is at least 1 (defaulting to 1 if not provided).
 * - Clamping the limit between 1 and 100 (defaulting to 10 if not provided).
 * - Calculating the number of items to skip as (page - 1) * limit.
 *
 * @param params - An object containing pagination settings:
 *   - page: The current page number (defaults to 1 if absent or less than 1)
 *   - limit: The maximum number of items per page (defaults to 10 if absent, and clamped between 1 and 100)
 * @returns An object with:
 *   - skip: The count of items to skip (offset)
 *   - take: The number of items per page (same as the limit)
 *   - page: The current page number
 *
 * @example
 * // Returns { skip: 0, take: 10, page: 1 }
 * calculatePagination({ page: 1, limit: 10 });
 *
 * @example
 * // Returns { skip: 10, take: 10, page: 2 } after adjusting invalid input values
 * calculatePagination({ page: 0, limit: 150 });
 */
export function calculatePagination(params: PaginationParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, Math.min(params.limit ?? 10, 100));
  const skip = (page - 1) * limit;

  return { skip, take: limit, page };
}

/**
 * Removes specified fields from a given object.
 *
 * This function creates a shallow copy of the provided object and then deletes
 * the properties listed in the optional `fieldsToRemove` array. If `fieldsToRemove`
 * is not provided or is empty, the original object is returned without modification.
 *
 * @param data - The original object from which properties should be removed.
 * @param fieldsToRemove - An optional array of keys identifying the properties to remove.
 * @returns A new object with the specified fields removed, or the original object if no fields are specified.
 *
 * @example
 * const user = { id: 1, name: 'Alice', password: 'secret' };
 * const safeUser = removeFields(user, ['password']);
 * // safeUser is { id: 1, name: 'Alice' }
 */
export function removeFields<D, T extends Record<string, D>>(
  data: T,
  fieldsToRemove?: string[]
): Partial<T> {
  if (!fieldsToRemove?.length) return data;
  
  const result = { ...data };
  fieldsToRemove.forEach(field => delete result[field]);
  return result;
}
