import { useMemo, useState } from "react";
import { FiPackage, FiTag, FiHash, FiEdit3, FiTrash2, FiPlus } from "react-icons/fi";
import { LuPhilippinePeso } from "react-icons/lu";
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
import { useRolePricing } from "@/hooks/use-role-pricing";

export type OrderItem = {
  variantId: string;
  quantity: number;
  customerNote?: string;
  price: number;
  originalPrice: number;
  appliedRole: string;
  productName: string;
  variantName: string;
};

type OrderItemsProps = {
  onItemsChange: (items: OrderItem[]) => void;
  disabled?: boolean;
  customerId?: string;
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
          rolePricing: true,
          inventory: true
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
    if (!selectedProductData?.variants) return [];
    
    return selectedProductData.variants.map((v) => {
      const pricingDetails = useRolePricing({
        variant: v,
        customerRole: customerData?.role ?? null,
        customerCollege: customerData?.college ?? null,
        productPostedByCollege: selectedProductData.postedBy?.college ?? null
      });

      return {
        label: `${v.variantName} - ${pricingDetails.formattedPrice} (${pricingDetails.appliedRole})`,
        value: v.id
      };
    });
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
    const pricingDetails = useRolePricing({
      variant,
      customerRole: customerData?.role ?? null,
      customerCollege: customerData?.college ?? null,
      productPostedByCollege: product.postedBy?.college ?? null
    });

    const newItem: OrderItem = {
      variantId: variant.id,
      quantity,
      customerNote: note || undefined,
      productName: product.title,
      variantName: variant.variantName,
      price: pricingDetails.price,
      originalPrice: Number(variant.price),
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
                      options={variantOptions}
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
            )}
            
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
                      <Badge variant="secondary" className="text-xs">Role: {item.appliedRole}</Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <FiHash className="size-3" />
                        Qty: {item.quantity}
                      </span>
                      <span className="flex items-center gap-1">
                        <LuPhilippinePeso className="size-3" />
                        Price: ₱{item.price}/unit
                      </span>
                      <span className="flex items-center gap-1 font-medium text-primary">
                        <LuPhilippinePeso className="size-3" />
                        Total: ₱{(item.price * item.quantity).toFixed(2)}
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