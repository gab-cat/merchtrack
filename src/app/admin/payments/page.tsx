"use client";
import React from "react";
import PageTitle from "@/components/private/page-title";
import { OnsitePayment } from "@/app/admin/payments/components/onsite-payment";
import { OffsitePayment } from "@/app/admin/payments/components/offsite-payment";
import { TransactionHistory } from "@/components/private/transaction-history";
import { offsitePayments as initialOffsitePayments, transactions as initialTransactions } from "@/types/payments";
import type { Transaction, OffsitePaymentRequest } from "@/types/payments";

interface PaymentsPageState {
  offsitePayments: OffsitePaymentRequest[];
  transactions: Transaction[];
}

export default class PaymentsPage extends React.Component<object, PaymentsPageState> {
  constructor(props: object) {
    super(props);
    this.state = {
      offsitePayments: initialOffsitePayments,
      transactions: initialTransactions,
    };
  }

  handleOnsitePayment = (orderId: string, amount: number) => {
    const order = this.state.offsitePayments.find((p) => p.orderId === orderId);
    const newTransaction: Transaction = {
      id: `TRX${this.state.transactions.length + 1}`.padStart(6, "0"),
      orderId,
      orderNo: order?.orderNo || `#${orderId}`,
      customerName: order?.customerName || "Customer",
      amount,
      paymentType: "onsite",
      date: new Date().toISOString().split("T")[0],
    };
    this.setState((prevState) => ({
      transactions: [newTransaction, ...prevState.transactions],
    }));
  };

  handleOffsiteConfirm = (payment: OffsitePaymentRequest) => {
    this.setState((prevState) => ({
      offsitePayments: prevState.offsitePayments.filter((p) => p.orderId !== payment.orderId),
    }));

    const newTransaction: Transaction = {
      id: `TRX${this.state.transactions.length + 1}`.padStart(6, "0"),
      orderId: payment.orderId,
      orderNo: payment.orderNo,
      customerName: payment.customerName,
      amount: payment.amount,
      paymentType: "offsite",
      date: new Date().toISOString().split("T")[0],
    };
    this.setState((prevState) => ({
      transactions: [newTransaction, ...prevState.transactions],
    }));
  };

  handleOffsiteReject = (payment: OffsitePaymentRequest) => {
    this.setState((prevState) => ({
      offsitePayments: prevState.offsitePayments.filter((p) => p.orderId !== payment.orderId),
    }));
  };

  render() {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <PageTitle title='Payments' />
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <OnsitePayment onPaymentComplete={this.handleOnsitePayment} />
          </div>
          <div className="space-y-4">
            <OffsitePayment payments={this.state.offsitePayments} onConfirm={this.handleOffsiteConfirm} onReject={this.handleOffsiteReject} />
            <TransactionHistory transactions={this.state.transactions} />
          </div>
        </div>
      </div>
    );
  }
}