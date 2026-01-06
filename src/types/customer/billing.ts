export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

export interface Subscription {
  id: string;
  isActive: boolean;
  autoRenew: boolean;
  startDate: Date | string;
  endDate: Date | string;
  plan: Plan; 
}

export interface Invoice {
  id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
  createdAt: Date | string;
  dueDate: Date | string;
  subscriptionId: string;
  subscription: {
      plan: Plan;
  }; 
}

export interface PaymentMethod {
  id: string;
  cardLast4: string;
  cardBrand: string;
  isDefault: boolean;
  holderName: string;
}

export interface BillingData {
  subscriptions: Subscription[];
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
}