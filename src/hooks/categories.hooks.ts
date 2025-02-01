import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/category.actions";
import useToast from "@/hooks/use-toast";

export function useCategoriesQuery () {
  return useQuery({
    queryKey: ['categories'],
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
    }
  });
}