import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/category.actions";
import useToast from "@/hooks/use-toast";

/**
 * Custom React hook for fetching category data.
 *
 * This hook leverages the `useQuery` hook from `@tanstack/react-query` to perform an asynchronous fetch of
 * category data via the `getCategories` API call. The query is uniquely identified by the key `['categories']`.
 *
 * The asynchronous query function checks the response from `getCategories`. If the response indicates failure
 * (i.e., `response.success` is false), it displays an error toast using `useToast` with an appropriate error message
 * and title, and returns an empty array. If the response is successful, it returns the fetched category data.
 *
 * @returns A query result object from `useQuery` containing:
 * - `data`: The fetched category data if the fetch is successful, or an empty array if not.
 * - Other properties and methods provided by `useQuery` for further query handling.
 */
export function useCategoriesQuery () {
  return useQuery({
    queryKey: ['categories:all'],
    queryFn: async () => {
      const response = await getCategories();
      if (!response.success) {
        useToast({
          type: 'error',
          message: response.message as string,
          title: 'Error fetching categories'
        });
        return [];
      }
      return response.success ? response.data : [];
    },
    staleTime: Infinity
  });
}