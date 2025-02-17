'use client';

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiPackage, FiShoppingBag } from "react-icons/fi";
import Link from "next/link";
import { CustomerValidation } from "./customer-validation";
import { OrderItems, type OrderItem } from "./order-items";
import { OrderSummary } from "./order-summary";
import useToast from "@/hooks/use-toast";
import { createOrder } from "@/actions/orders.actions";
import { createOrderSchema, type CreateOrderType } from "@/schema/orders.schema";
import { useUserStore } from "@/stores/user.store";
import { Steps } from "@/components/ui/steps";
import { Button } from "@/components/ui/button";

export function NewOrderForm() {
  const { userId } = useUserStore();
  const router = useRouter();
  const [customerId, setCustomerId] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const showToast = useToast;

  const form = useForm<CreateOrderType>({
    mode: 'onChange',
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      processedById: userId as string,
      discountAmount: 0,
      totalAmount: 0,
      customerId: '',
      estimatedDelivery: new Date(),
      orderItems: []
    }
  });

  const calculateTotalAmount = (items: OrderItem[], discountAmount: number = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return Math.max(0, subtotal - discountAmount);
  };

  // Update total amount whenever order items or discount changes
  React.useEffect(() => {
    const discountAmount = form.getValues('discountAmount') || 0;
    const totalAmount = calculateTotalAmount(orderItems, discountAmount);
    form.setValue('totalAmount', totalAmount);
  }, [orderItems, form.watch('discountAmount')]);

  // Update form values when customerId changes
  React.useEffect(() => {
    if (customerId) {
      form.setValue('customerId', customerId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [customerId, form]);

  // Update form values when date changes
  React.useEffect(() => {
    form.setValue('estimatedDelivery', date, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [date, form]);

  // Update form values when order items change
  React.useEffect(() => {
    const formattedItems = orderItems.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
      customerNote: item.customerNote,
      size: item.size
    }));
    
    form.setValue('orderItems', formattedItems, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [orderItems, form]);

  const mutation = useMutation({
    mutationFn: (data: CreateOrderType) => createOrder(userId!, data),
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Order Created",
        message: "The order has been created successfully."
      });
      router.push('/admin/orders');
    },
    onError: (error) => {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to create order. Please try again."
      });
    }
  });

  const handleSubmit = async (data: CreateOrderType) => {
    if (!customerId) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please validate customer email first"
      });
      return;
    }
    
    if (orderItems.length === 0) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please add at least one item to the order"
      });
      return;
    }

    const formattedItems = orderItems.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
      customerNote: item.customerNote,
      size: item.size
    }));

    try {
      mutation.mutate({
        ...data,
        customerId,
        orderItems: formattedItems,
        totalAmount: calculateTotalAmount(orderItems, data.discountAmount),
        estimatedDelivery: date,
      });
    } catch (error: unknown) {
      showToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to submit order. Please check all required fields."
      });
    }
  };

  // Handle date changes safely
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  // Calculate current step
  const getCurrentStep = () => {
    if (!customerId) return 1;
    if (orderItems.length === 0) return 2;
    return 3;
  };

  const currentStep = getCurrentStep();

  const steps = [
    {
      title: "Customer",
      icon: <FiCheckCircle className="size-5" />,
      description: "Validate customer",
      status: currentStep >= 1 ? "current" : "upcoming",
      completed: currentStep > 1
    },
    {
      title: "Items",
      icon: <FiPackage className="size-5" />,
      description: "Add order items",
      status: currentStep >= 2 ? "current" : "upcoming",
      completed: currentStep > 2
    },
    {
      title: "Summary",
      icon: <FiShoppingBag className="size-5" />,
      description: "Review and confirm",
      status: currentStep === 3 ? "current" : "upcoming",
      completed: false
    }
  ] as const;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-end">
        <Link href='/admin/orders'>
          <Button variant='outline' size="sm">
            Back to Orders
          </Button>
        </Link>
      </div>

      <Steps steps={steps} currentStep={currentStep} />

      <div className="grid gap-6">
        <div className="mx-auto w-full max-w-3xl">
          <CustomerValidation 
            onCustomerValidated={setCustomerId}
            disabled={mutation.isPending}
          />
        </div>

        {customerId && (
          <div className="mx-auto w-full">
            <OrderItems
              onItemsChange={setOrderItems}
              disabled={mutation.isPending}
            />
          </div>
        )}

        {orderItems.length > 0 && (
          <div className="mx-auto w-full max-w-3xl">
            <OrderSummary
              orderItems={orderItems}
              form={form}
              onSubmit={handleSubmit}
              isPending={mutation.isPending}
              date={date}
              onDateChange={handleDateChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}