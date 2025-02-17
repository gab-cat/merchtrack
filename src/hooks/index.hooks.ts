import { useQuery } from "@tanstack/react-query";
import { EMPTY_PAGINATED_RESPONSE } from "@/constants";
import useToast from "@/hooks/use-toast";
import { useUserStore } from "@/stores/user.store";
import { PaginatedResponse, QueryParams } from "@/types/common";

interface ResourceQueryParams<T> {
  resource: string;
  fetcher: (userId: string, params: QueryParams) => Promise<ActionsReturnType<PaginatedResponse<T>>>;
  params?: QueryParams;
}

/**
 * Fetches resource data using a custom query hook with caching and error handling.
 *
 * This custom hook retrieves the current user ID from the user store and uses `useQuery` from React Query
 * to fetch data for the specified resource. The query is only enabled if a valid user ID is available.
 *
 * The hook configures caching parameters dynamically:
 * - For the "categories" resource, the data is considered fresh indefinitely (staleTime = Infinity)
 *   and garbage collected after 24 hours.
 * - For other resources, the data becomes stale immediately (staleTime = 0) and is available for garbage
 *   collection after 5 minutes.
 *
 * The provided fetcher function is called with the user ID and additional query parameters. If the fetcher
 * returns a response indicating failure, an error toast is displayed and an empty paginated response is returned.
 *
 * @param params - An object containing:
 *   - resource: The name of the resource to fetch.
 *   - fetcher: A function that fetches the resource data.
 *   - params: (Optional) Additional query parameters.
 * @returns The result object from `useQuery`, which includes the resource data or a fallback response on error.
 */
export function useResourceQuery<T>({ resource, fetcher, params = {} }: ResourceQueryParams<T>) {
  const { userId } = useUserStore();
  
  return useQuery({
    enabled: !!userId,
    queryKey: [`${resource}:all`, params],
    staleTime: resource === "categories" ? Infinity : 0,
    gcTime: resource === "categories" ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000,
    queryFn: async () => {
      const response = await fetcher(userId as string, params);
      if (!response.success) {
        useToast({
          type: "error",
          message: response.message as string,
          title: `Error fetching ${resource}`,
        });
        return EMPTY_PAGINATED_RESPONSE;
      }
      return response.data;
    }
  });
}

interface ResourceByIdQueryParams<T> {
  resource: string;
  fetcher: (userId: string, id: string, params: QueryParams) => Promise<ActionsReturnType<T>>;
  identifier: string;
  params?: QueryParams;
}

export function useResourceByIdQuery<T>({ resource, fetcher, identifier, params = {} }: ResourceByIdQueryParams<T>) {
  const { userId } = useUserStore();
  return useQuery({
    enabled: !!userId && !!identifier,
    queryKey: [`${resource}:${identifier}`, params],
    queryFn: async () => {
      const response = await fetcher(userId as string, identifier, params);
      if (!response.success) {
        useToast({
          type: "error",
          message: response.message as string,
          title: `Error fetching ${resource}`,
        });
        return null;
      }
      return response.data;
    }
  });
}