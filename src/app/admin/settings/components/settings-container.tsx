"use client";

import { useQuery } from '@tanstack/react-query';
import { getAnnouncements } from '../_actions';
import { SystemMessageForm } from './system-message-form';
import { AnnouncementList } from './announcement-list';
import { AnnouncementForm } from './announcement-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface SettingsContainerProps {
  userId: string;
}

export function SettingsContainer({ userId }: Readonly<SettingsContainerProps>) {
  const { data, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const result = await getAnnouncements();
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    }
  });

  return (
    <Tabs defaultValue="announcements" className="space-y-4">
      <TabsList className='space-x-4'>
        <TabsTrigger className='rounded-md' value="announcements">Announcements</TabsTrigger>
        <TabsTrigger className='rounded-md' value="motd">Message of the Day</TabsTrigger>
      </TabsList>
      
      <TabsContent value="announcements" className="space-y-4">
        <AnnouncementForm userId={userId} onSuccess={() => refetch()} />
        <AnnouncementList 
          announcements={data  ?? []} 
          userId={userId}
          onUpdate={() => refetch()}
        />
      </TabsContent>
      
      <TabsContent value="motd">
        <SystemMessageForm userId={userId} onSuccess={() => refetch()} />
      </TabsContent>
    </Tabs>
  );
}