import { useQuery } from "@tanstack/react-query";
import { getProductById, getProductBySlug, getProducts } from "@/actions/products.actions";
import { useUserStore } from "@/stores/user.store";
import { QueryParams } from "@/types/common";
import useToast from "@/hooks/use-toast";
import { EMPTY_PAGINATED_RESPONSE } from "@/constants";

export function useProductsQuery(params: QueryParams = {}) {
  const { userId } = useUserStore();
  return useQuery({
    enabled: !!userId,
    queryKey: ["products:all"],
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