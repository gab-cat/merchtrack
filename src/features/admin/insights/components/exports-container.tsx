'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { File, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

import { exportOrders, exportProducts, exportProductOrders } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { fadeInUp } from '@/constants/animations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXPORT_OPTIONS = [
  {
    id: 'orders',
    title: 'Orders Export',
    description: 'Export orders with product details, variants, quantities, and notes',
    icon: FileSpreadsheet,
    action: exportOrders,
    requiresProduct: false,
  },
  {
    id: 'products',
    title: 'Products Analytics',
    description: 'Export product sales analytics with variant details and total quantities',
    icon: File,
    action: exportProducts,
    requiresProduct: false,
  },
  {
    id: 'product-orders',
    title: 'Product Orders History',
    description: 'Export detailed order history for a specific product including variants and customer details',
    icon: FileSpreadsheet,
    action: exportProductOrders,
    requiresProduct: true,
  },
] as const;

export default function ExportsContainer() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedProduct, setSelectedProduct] = useState<string>();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    const handleStartDateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setStartDate(customEvent.detail.value ? new Date(customEvent.detail.value) : undefined);
    };

    const handleEndDateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setEndDate(customEvent.detail.value ? new Date(customEvent.detail.value) : undefined);
    };

    window.addEventListener('datechange:start-date', handleStartDateChange);
    window.addEventListener('datechange:end-date', handleEndDateChange);

    return () => {
      window.removeEventListener('datechange:start-date', handleStartDateChange);
      window.removeEventListener('datechange:end-date', handleEndDateChange);
    };
  }, []);

  const { data: products } = useQuery({
    queryKey: ['products-for-export'],
    queryFn: async () => {
      const response = await fetch('/api/products/list', {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const handleExport = async (
    exportId: string, 
    action: typeof exportOrders | typeof exportProducts | typeof exportProductOrders
  ) => {
    try {
      setIsLoading(exportId);
      const csvData = await action({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        ...(exportId === 'product-orders' && { productId: selectedProduct }),
      });

      // Create blob and trigger download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportId}_${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <motion.div {...fadeInUp} className="space-y-6">
      {/* Date Range and Product Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <DatePicker
            name="start-date"
            initialValue={startDate?.toISOString()}
            placeholder="Start date"
          />
          <span className="text-muted-foreground">to</span>
          <DatePicker
            name="end-date"
            initialValue={endDate?.toISOString()}
            placeholder="End date"
          />
          <Select
            value={selectedProduct}
            onValueChange={setSelectedProduct}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products?.map((product: { id: string; title: string }) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            setStartDate(undefined);
            setEndDate(undefined);
            setSelectedProduct(undefined);
          }}>
            Reset
          </Button>
        </div>
      </Card>

      {/* Export Options */}
      <div className="grid gap-4 md:grid-cols-2">
        {EXPORT_OPTIONS.map((option) => (
          <Card 
            key={option.id} 
            className={`transition-all ${
              option.requiresProduct && !selectedProduct 
                ? 'cursor-not-allowed opacity-50' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <option.icon className="size-8 text-primary" />
              <div>
                <CardTitle>{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => handleExport(option.id, option.action)}
                disabled={!!isLoading || (option.requiresProduct && !selectedProduct)}
              >
                {isLoading === option.id ? (
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                ) : (
                  <Download className="mr-2 size-4" />
                )}
                Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}