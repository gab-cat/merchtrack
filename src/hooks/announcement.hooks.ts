import { useQuery } from "@tanstack/react-query";
import useToast from "@/hooks/use-toast";
import { getAnnouncements } from "@/app/admin/settings/_actions";


export function useAnnouncementsQuery(limit: number = 10) {
  return useQuery({
    queryKey: ['annoucements:all'],
    queryFn: async () => {
      const response = await getAnnouncements(limit);
      if (!response.success) {
        useToast({
          type: 'error',
          message: response.message as string,
          title: 'Error fetching announcements'
        });
        return [];
      }
      return response.success ? response.data : [];
    },
  });
}