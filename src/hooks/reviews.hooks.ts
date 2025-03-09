import { getProductReviewsBySlug } from "@/actions/products.actions";
import { useResourceByIdQuery } from "@/hooks/index.hooks";
import { QueryParams } from "@/types/common";

export function useReviewsBySlugQuery(slug: string, limitFields: string[] = []) {
  return useResourceByIdQuery({
    resource: "reviews",
    fetcher: async (userId: string, id: string, params: QueryParams) => 
      await getProductReviewsBySlug({ userId, slug: id, limitFields: params.limitFields }),
    identifier: slug,
    params: { limitFields }
  });
}