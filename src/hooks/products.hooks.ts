import { useQuery } from "@tanstack/react-query";
import { getProductById, getProductBySlug, getProducts } from "@/actions/products.actions";
import { useUserStore } from "@/stores/user.store";
import { QueryParams } from "@/types/common";
import useToast from "@/hooks/use-toast";
import { EMPTY_PAGINATED_RESPONSE } from "@/constants";


/**
 * Fetches a paginated list of products for the current user.
 *
 * This hook retrieves the current user's ID from the store and uses React Query to perform an asynchronous fetch
 * via the `getProducts` API call. The query is enabled only if a valid user ID exists. If the fetch fails, an error
 * toast notification is displayed and a predefined empty paginated response is returned.
 *
 * @param params - Optional query parameters for filtering or paginating the products. Defaults to an empty object.
 * @returns An object containing the query state including `data`, `error`, and `status` from React Query.
 *
 * @example
 * const { data, error, status } = useProductsQuery({ page: 1, limit: 10 });
 */
export function useProductsQuery(params: QueryParams = {}) {
  const { userId } = useUserStore();
  return useQuery({
    enabled: !!userId,
    queryKey: ["products:all", params],
    queryFn: async () => {
      const response = await getProducts(userId as string, params);
      if (!response.success) {
        useToast({
          type: "error",
          message: response.message as string,
          title: "Error fetching products",
        });
        return EMPTY_PAGINATED_RESPONSE;
      }
      return response.success ? response.data : [];
    }
  });
}

/**
 * Retrieves a product by its ID.
 *
 * This hook fetches a single product by calling the `getProductById` API function using the current user's ID from the user store. It leverages React Query to cache and manage the request. If no product ID is provided or if the API call fails, an error toast is displayed and `null` is returned.
 *
 * @param productId - The unique identifier for the product.
 * @param limitFields - An optional array specifying which fields to limit in the fetched product data.
 * @returns A query object from React Query containing the product data on success, or `null` if the product is not found or an error occurs.
 *
 * @example
 * const { data, error, isLoading } = useProductQuery('12345', ['name', 'price']);
 */
export function useProductQuery(productId: string, limitFields: string[] = []) {
  const { userId } = useUserStore();
  return useQuery({
    queryKey: [`products:${productId}`],
    queryFn: async () => {
      if (!productId) return null;
      const response = await getProductById({
        userId: userId as string,
        productId,
        limitFields
      });
      if (!response.success) {
        useToast({
          type: "error",
          message: response.message as string,
          title: "Product not found",
        });
        return null;
      }
      return response.success ? response.data : null;
    },
    enabled: !!productId
  });
}

/**
 * Fetches a product by its slug.
 *
 * This custom hook uses React Query to retrieve a product using its unique slug identifier. It obtains the current user's ID from the user store and only enables the query when a user is authenticated. The query function calls the `getProductBySlug` API endpoint with the given slug and optional limit fields.
 *
 * If the API response indicates failure, an error toast notification is displayed and the query function returns `null`. Otherwise, it returns the fetched product data.
 *
 * @param slug - The unique slug identifier for the product.
 * @param limitFields - An optional array of field names to limit the result data.
 * @returns A query object that resolves to the product data if found, or `null` on failure.
 *
 * @example
 * const { data, error, isLoading } = useProductSlugQuery('example-slug', ['name', 'price']);
 */
export function useProductSlugQuery(slug: string, limitFields: string[] = []) {
  const { userId } = useUserStore();
  return useQuery({
    enabled: !!userId,
    queryKey: [`products:slug:${slug}`],
    queryFn: async () => {
      const response = await getProductBySlug({
        userId: userId as string,
        slug,
        limitFields
      });
      if (!response.success) {
        useToast({
          type: "error",
          message: response.message as string,
          title: "Product not found",
        });
        return null;
      }
      return response.success ? response.data : null;
    },
  });
}