'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { adjustVariantInventory } from '../actions';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUserStore } from '@/stores/user.store';
import useToast from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type InventoryAdjusterProps = {
  productId: string;
  variantId: string;
  variantName: string;
  currentInventory: number;
  onSuccess?: (newInventory: number) => void;
  slug: string;
}

export function InventoryAdjuster({
  productId,
  variantId,
  variantName,
  currentInventory,
  onSuccess,
  slug
}: Readonly<InventoryAdjusterProps>) {
  const [adjustmentAmount, setAdjustmentAmount] = useState(1);
  const [reason, setReason] = useState('');
  const { userId } = useUserStore();
  const toast = useToast;
  const queryClient = useQueryClient();

  const { mutate: adjustInventory, isPending } = useMutation({
    mutationKey: [`products:${slug}`],
    mutationFn: async ({ adjustment }: { adjustment: number }) => {
      if (!userId) throw new Error("User ID is required");
      
      const response = await adjustVariantInventory(
        userId, 
        productId, 
        variantId, 
        adjustment,
        reason || undefined
      );
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        type: "success",
        message: `Inventory updated successfully to ${data?.newInventory}`,
        title: "Success"
      });
      
      if (onSuccess) {
        onSuccess(data?.newInventory as number);
      }
      
      // Reset reason field after successful update
      setReason('');
      queryClient.invalidateQueries({ queryKey: [`products:${slug}`] });
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        message: error.message || "Failed to update inventory",
        title: "Error updating inventory"
      });
    }
  });

  const handleAdjustment = (adjustment: number) => {
    adjustInventory({ adjustment });
  };

  const handleAdjustmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAdjustmentAmount(value);
    } else {
      setAdjustmentAmount(1); // Default to 1 if invalid
    }
  };

  return (
    <div className="space-y-4 rounded-md border border-gray-200 p-4">
      <h3 className="text-lg font-medium">Adjust Inventory for &quot;{variantName}&quot;</h3>
      <div className="flex items-center">
        <span className="mr-4 text-sm font-medium">Current Stock:</span>
        <span className="rounded-md bg-primary-100 px-2 font-semibold text-primary">{currentInventory}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adjustmentAmount">Adjustment Amount</Label>
          <Input 
            id="adjustmentAmount"
            type="number"
            min="1"
            value={adjustmentAmount}
            onChange={handleAdjustmentAmountChange}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reason">Reason (optional)</Label>
          <Input 
            id="reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., New shipment received"
            className="w-full"
          />
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn("flex-1 w-max border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600", 
            isPending && "pointer-events-none opacity-50")}
          onClick={() => handleAdjustment(-adjustmentAmount)}
          disabled={isPending}
        >
          {isPending ? (
            <AiOutlineLoading3Quarters className="mr-2 size-4 animate-spin" />
          ) : (
            <FaMinus className="mr-2 size-4" />
          )}
          Decrease Stock
        </Button>
        
        <Button
          type="button"
          size="sm"
          className={cn("flex-1 w-max bg-green-500 text-white hover:bg-green-600", 
            isPending && "pointer-events-none opacity-50")}
          onClick={() => handleAdjustment(adjustmentAmount)}
          disabled={isPending}
        >
          {isPending ? (
            <AiOutlineLoading3Quarters className="mr-2 size-4 animate-spin" />
          ) : (
            <FaPlus className="mr-2 size-4" />
          )}
          Increase Stock
        </Button>
      </div>
    </div>
  );
}
