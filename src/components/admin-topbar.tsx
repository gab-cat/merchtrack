import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';

export function AdminTopbar() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <div className="flex items-center justify-between">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="unfulfilled">Unfulfilled</TabsTrigger>
            <TabsTrigger value="canceled">Canceled</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search"
            className="w-[300px]"
          />
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Order
          </Button>
        </div>
      </div>
    </div>
  );
}

