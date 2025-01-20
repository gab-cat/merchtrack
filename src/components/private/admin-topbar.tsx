import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTitle from '@/components/private/page-title';
import { ADMIN_TABS } from '@/constants';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'CANCELLED' | 'DELIVERED';


const activeTabStyle = "rounded-md data-[state=active]:text-neutral-2 data-[state=active]:bg-primary";
export function AdminTopbar() {
  const [activeTab, setActiveTab] = useState<OrderStatus | null>(ADMIN_TABS[0].value);

  function handleTabChange(value: string) {
    setActiveTab(value as OrderStatus);
  }

  function handleSearchDebounced(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Orders" />
      <div className="flex items-center justify-between">
        <Tabs 
          value={activeTab as string} 
          onValueChange={handleTabChange}
        >
          <TabsList>
            {ADMIN_TABS.map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value as string}
                className={activeTabStyle}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search"
            className="w-[300px]"
            aria-label="Search orders"
            onChange={handleSearchDebounced}
          />
          <Button className="text-white">
            <Plus className="mr-2 size-4" />
            Add Order
          </Button>
        </div>
      </div>
    </div>
  );
}

