"use client";

import { useState } from "react";
import { FaMoneyBillWave, FaPaperPlane } from "react-icons/fa";
import { type Order } from "@/types/Misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentFormProps {
  selectedOrder: Order | null
  onPaymentSubmit: (amount: number) => void
}

export function PaymentForm({ selectedOrder, onPaymentSubmit }: PaymentFormProps) {
  const [paymentOption, setPaymentOption] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (selectedOrder && amount) {
      const paymentAmount = Number.parseFloat(amount);
      if (!isNaN(paymentAmount) && paymentAmount > 0 && paymentAmount <= selectedOrder.balance) {
        onPaymentSubmit(paymentAmount);
        setAmount(""); // Reset amount after submission
      }
    }
  };

  const handleSendReceipt = () => {
    console.log("Receipt sent");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!selectedOrder}
            max={selectedOrder?.balance}
          />
          <Select disabled={!selectedOrder} value={paymentOption} onValueChange={setPaymentOption}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Onsite">Onsite</SelectItem>
              <SelectItem value="Offise">Offsite</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1"
              disabled={
                !selectedOrder || !amount || !paymentOption || Number.parseFloat(amount) > (selectedOrder?.balance || 0)
              }
              onClick={handleSubmit}
            >
              <FaMoneyBillWave className="mr-2" /> Submit
            </Button>
            <Button variant="outline" className="flex-1" disabled={!selectedOrder} onClick={handleSendReceipt}>
              <FaPaperPlane className="mr-2" /> Send Receipt
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


