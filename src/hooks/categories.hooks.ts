import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/category.actions";
import useToast from "@/hooks/use-toast";

/**
 * Custom React hook for fetching category data.
 *
 * This hook utilizes `useQuery` from `@tanstack/react-query` to asynchronously retrieve category data using the
 * `getCategories` API call. The query is uniquely identified by the key `['categories:all']`.
 *
 * The query function checks the API response; if `response.success` is false, it triggers an error toast via `useToast`
 * (displaying the error message with the title "Error fetching categories") and returns an empty array. If the response
 * is successful, it returns the fetched category data.
 *
 * The `staleTime` is set to `Infinity`, ensuring that the fetched data remains fresh indefinitely without automatic refetching.
 *
 * @returns A query result object from `useQuery` containing:
 * - `data`: The fetched category data if successful, or an empty array upon failure.
 * - Additional properties and methods from `useQuery` for managing and interacting with the query state.
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