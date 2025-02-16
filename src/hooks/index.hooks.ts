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