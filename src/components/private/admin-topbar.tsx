import { Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTitle from '@/components/private/page-title';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'unfulfilled', label: 'Unfulfilled' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'unpaid', label: 'Unpaid' },
];

const activeTabStyle = "rounded-md data-[state=active]:text-neutral-2 data-[state=active]:bg-primary";

export function AdminTopbar() {
  return (
    <div className="space-y-4">
      <PageTitle title="Orders" />
      <div className="flex items-center justify-between">
        <Tabs defaultValue="all">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
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

