'use client';

import { useState, useEffect } from 'react';

/**
 * A custom React hook that returns a debounced version of the given value.
 *
 * The hook delays updating the returned value until after the specified delay has elapsed
 * since the last change. It sets a timeout to update the debounced value and clears the timeout
 * when the value or delay changes to avoid memory leaks.
 *
 * @param value - The input value that will be debounced.
 * @param delay - The delay in milliseconds to wait before updating the debounced value.
 * @returns The debounced value.
 *
 * @example
 * // Debounce a search input to avoid rapid state updates
 * const debouncedQuery = useDebouncedValue(query, 300);
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}