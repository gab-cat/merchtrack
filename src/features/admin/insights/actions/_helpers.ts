// Not strictly needed here but good for context if types evolve

// Type definitions
export interface ExportItem {
  order: {
    id: string;
    createdAt: Date;
    customer: {
      firstName: string | null;
      lastName: string | null;
    };
    status: string;
    paymentStatus: string;
    payments?: Array<{ paymentMethod: string }>;
    customerNotes?: string;
  };
  variant: {
    product: {
      id: string;
      title: string;
    };
    variantName: string;
  };
  quantity: number;
  price: number | string | { toString(): string };
  size: string | null | undefined;
  customerNote?: string;
}

export interface ExportParams {
  startDate?: string;
  endDate?: string;
  productId?: string; // productId is optional here as not all exports use it
}

// Helper to create CSV content
export function arrayToCSV(data: Record<string, unknown>[]) {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row)
      .map(value => `"${String(value).replace(/"/g, '""')}"`)
      .join(',')
  );
  return `${headers}\n${rows.join('\n')}`;
}

export function processExportData(item: ExportItem) {
  return {
    orderId: item.order.id,
    orderDate: item.order.createdAt.toISOString(),
    customerName: `${item.order.customer.firstName ?? ''} ${item.order.customer.lastName ?? ''}`.trim() || 'N/A',
    productId: item.variant.product.id,
    productName: item.variant.product.title,
    variantName: item.variant.variantName,
    quantity: item.quantity,
    pricePerUnit: Number(item.price),
    totalAmount: Number(item.price) * Number(item.quantity),
    size: item.size ?? 'N/A',
    customerNote: item.customerNote ?? '',
    orderNote: item.order.customerNotes ?? 'N/A',
    orderStatus: item.order.status,
    paymentStatus: item.order.paymentStatus,
    paymentMethod: item.order.payments?.[0]?.paymentMethod ?? 'N/A',
  };
} 