'use client';

import dynamic from 'next/dynamic';
import { LineChart, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const InsightsContainer = dynamic(() => import('./insights-container'));
const ExportsContainer = dynamic(() => import('./exports-container'));

export default function InsightsTabs() {
  return (
    <Tabs defaultValue="insights">
      <TabsList className='space-x-4'>
        <TabsTrigger value="insights" className="flex items-center gap-2">
          <LineChart className="size-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="exports" className="flex items-center gap-2">
          <FileSpreadsheet className="size-4" />
          Data Exports
        </TabsTrigger>
      </TabsList>
      <TabsContent value="insights">
        <InsightsContainer />
      </TabsContent>
      <TabsContent value="exports">
        <ExportsContainer />
      </TabsContent>
    </Tabs>
  );
}