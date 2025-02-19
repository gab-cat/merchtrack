'use client';

import { Prisma, ProductSize } from "@prisma/client";
import { useMemo, useState } from "react";
import { FiPackage, FiTag, FiDollarSign, FiHash, FiEdit3, FiTrash2, FiPlus } from "react-icons/fi";
import { FormSection } from "./form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProductsQuery } from "@/hooks/products.hooks";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import useToast from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useUserQuery } from "@/hooks/users.hooks";

// Define types for role-based pricing
type RolePricing = {
  ALUMNI?: number;
  OTHERS: number;
  PLAYER?: number;
  STUDENT?: number;
  STAFF_FACULTY?: number;
  [key: string]: number | undefined;
};

type ProductWithVariants = {
  id: string;
  title: string;
  postedBy: {
    college: string;
  };
  variants: Array<{
    id: string;
    variantName: string;
    price: Prisma.Decimal | number;  // Support both Decimal and number
    rolePricing: RolePricing;
  }>;
};

export type OrderItem = {
  variantId: string;
  quantity: number;
  customerNote?: string;
  size?: ProductSize;
  price: number;
  originalPrice: number;
  appliedRole: string;
  productName: string;  // For display purposes
  variantName: string;  // For display purposes
};

type OrderItemsProps = {
  onItemsChange: (items: OrderItem[]) => void;
  disabled?: boolean;
  customerId?: string;
};

// Update pricing function with proper types
const getRolePricingDetails = (
  product: ProductWithVariants,
  variant: ProductWithVariants["variants"][0],
  customerRole: string | undefined | null,
  customerCollege: string | undefined | null
) => {
  try {
    const rolePricing = variant.rolePricing;
    
    // Ensure we have a valid rolePricing object with OTHERS price
    if (!rolePricing || typeof rolePricing.OTHERS !== 'number') {
      return {
        price: Number(variant.price) || 0,
        appliedRole: "OTHERS"
      };
    }

    // If no customer role or college is provided, default to OTHERS
    if (!customerRole || !customerCollege) {
      return {
        price: rolePricing.OTHERS,
        appliedRole: "OTHERS"
      };
    }

    const isFromSameCollege = product.postedBy?.college === customerCollege && 
                             customerCollege !== "NOT_APPLICABLE";

    // Check if customer has a role-specific price and is from the same college
    if (isFromSameCollege && 
        typeof rolePricing[customerRole] === 'number' && 
        rolePricing[customerRole] !== undefined) {
      return {
        price: rolePricing[customerRole],
        appliedRole: customerRole
      };
    }

    // Default to OTHERS price
    return {
      price: rolePricing.OTHERS,
      appliedRole: "OTHERS"
    };
  } catch (error) {
    console.error(`Error processing role pricing for variant ${variant.id}:`, error);
    return {
      price: Number(variant.price) || 0,
      appliedRole: "OTHERS"
    };
  }
};

export function OrderItems({ onItemsChange, disabled, customerId }: Readonly<OrderItemsProps>) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const showToast = useToast;

  // Fetch customer data to get their role and college
  const { data: customerData } = useUserQuery(customerId ?? "");
  
  const { data: productsData, isLoading } = useProductsQuery({
    take: 50,
    limit: 50,
    include: {
      variants: {
        select: {
          id: true,
          variantName: true,
          price: true,
          rolePricing: true
        }
      },
      postedBy: {
        select: {
          college: true
        }
      }
    },
    where: {
      isDeleted: false
    }
  });

  const products = useMemo(() => {
    return (productsData?.data || []).map(product => ({
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        price: Number(variant.price)
      }))
    }));
  }, [productsData?.data]);
  
  const productOptions = useMemo(() => products.map((p) => ({
    label: p.title,
    value: p.id
  })), [products]);

  const selectedProductData = useMemo(() => 
    products.find((p) => p.id === selectedProduct),
  [products, selectedProduct]
  );

  const variantOptions = useMemo(() => {
    if (!selectedProductData?.variants) {
      return [];
    }
    
    if (!Array.isArray(selectedProductData.variants)) {
      console.error('Variants data is not in the expected format');
      return [];
    }
    
    return selectedProductData.variants
      .filter(v => v.variantName && v.rolePricing) 
      .map((v) => {
        try {
          const pricingDetails = getRolePricingDetails(
            // @ts-expect-error - selectedProductData is not null
            selectedProductData,
            v,
            customerData?.role ?? "OTHERS",
            customerData?.college ?? "NOT_APPLICABLE"
          );
          
          return {
            label: `${v.variantName} - $${pricingDetails.price} (${pricingDetails.appliedRole})`,
            value: v.id
          };
        } catch (error) {
          console.error('Error processing variant:', error);
          return null;
        }
      })
      .filter(Boolean); // Remove any null entries from errors
  }, [selectedProductData, customerData]);

  const validateSelection = () => {
    if (!selectedProduct || !selectedVariant) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please select both a product and variant"
      });
      return false;
    }

    const product = products.find((p) => p.id === selectedProduct);
    const variant = product?.variants.find((v) => v.id === selectedVariant);
    
    if (!product || !variant) {
      showToast({
        type: "error",
        title: "Error",
        message: "Invalid product or variant selected"
      });
      return false;
    }

    return { product, variant };
  };

  const validateQuantity = () => {
    if (quantity < 1 || quantity > 100) {
      showToast({
        type: "error",
        title: "Error",
        message: "Quantity must be between 1 and 100"
      });
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setSelectedProduct("");
    setSelectedVariant("");
    setQuantity(1);
    setNote("");
  };

  const handleAddItem = () => {
    const selection = validateSelection();
    if (!selection) return;
    if (!validateQuantity()) return;

    const { product, variant } = selection;
    
    // Get role-based pricing
    const pricingDetails = getRolePricingDetails(
      // @ts-expect-error - product and variant are not null
      product, 
      variant, 
      customerData?.role ?? "OTHERS",
      customerData?.college ?? "NOT_APPLICABLE"
    );

    // Ensure price is properly converted to a number and has 2 decimal places
    const price = Number(parseFloat(pricingDetails.price.toString()).toFixed(2));

    const newItem: OrderItem = {
      variantId: variant.id,
      quantity,
      customerNote: note || undefined,
      productName: product.title,
      variantName: variant.variantName,
      price,
      originalPrice: price, // Set originalPrice same as price
      appliedRole: pricingDetails.appliedRole
    };

    const newItems = [...orderItems, newItem];
    setOrderItems(newItems);
    onItemsChange(newItems);
    resetForm();
  };

  const handleRemoveItem = (index: number) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
    onItemsChange(newItems);
  };

  return (
    <FormSection title="Order Items">
      <div className="grid gap-6">
        <Card className="border-border bg-card p-4">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="flex items-center gap-2 text-sm">
                  <FiPackage className="text-primary" />
                  Select Product
                </Label>
                <div className="mt-1.5">
                  <Combobox
                    options={productOptions}
                    value={selectedProduct}
                    onSelect={(value) => {
                      setSelectedProduct(value);
                      setSelectedVariant("");
                    }}
                    placeholder="Search products..."
                    emptyText={isLoading ? "Loading products..." : "No products found."}
                  />
                </div>
              </div>
              
              {selectedProduct && (
                <div>
                  <Label className="flex items-center gap-2 text-sm">
                    <FiTag className="text-primary" />
                    Select Variant
                  </Label>
                  <div className="mt-1.5">
                    <Combobox
                      options={variantOptions as { label: string; value: string }[]}
                      value={selectedVariant}
                      onSelect={setSelectedVariant}
                      placeholder="Choose variant..."
                      emptyText="No variants available."
                    />
                  </div>
                </div>
              )}
            </div>
            
            {selectedVariant && (
              <Card className="border-muted bg-card/50 rounded-lg border p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <FiHash className="text-primary" />
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setQuantity(Math.min(Math.max(1, val), 100));
                        }
                      }}
                      min={1}
                      max={100}
                      disabled={disabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <FiEdit3 className="text-primary" />
                      Note (Optional)
                    </Label>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add any special instructions..."
                      maxLength={500}
                      disabled={disabled}
                      className="resize-none"
                      rows={1}
                    />
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleAddItem}
                  disabled={disabled}
                  className="mt-4 w-full"
                  size="sm"
                >
                  <FiPlus className="mr-2" />
                  Add Item to Order
                </Button>
              </Card>
            )}
          </div>
        </Card>

        {orderItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <FiPackage className="text-primary" />
                Selected Items ({orderItems.length})
              </h3>
              {orderItems.length > 1 && (
                <p className="text-muted-foreground text-xs">
                  Total Items: {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              {orderItems.map((item, index) => (
                <Card
                  key={`${item.variantId}-${index}`} 
                  className="border-border group relative flex items-center justify-between overflow-hidden p-3 transition-all hover:shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-medium">{item.productName}</h4>
                      <Badge variant="outline" className="text-xs">{item.variantName}</Badge>
                      {item.size && (
                        <Badge variant="secondary" className="text-xs">Size: {item.size}</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">Role: {item.appliedRole}</Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <FiHash className="size-3" />
                        Qty: {item.quantity}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiDollarSign className="size-3" />
                        Price: ${item.price}/unit
                      </span>
                      <span className="flex items-center gap-1 font-medium text-primary">
                        <FiDollarSign className="size-3" />
                        Total: ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    {item.customerNote && (
                      <p className="text-muted-foreground text-xs">
                        Note: {item.customerNote}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    disabled={disabled}
                    className="text-muted-foreground hover:text-destructive ml-4 size-8 shrink-0"
                  >
                    <FiTrash2 className="size-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
}