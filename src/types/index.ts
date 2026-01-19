export interface Loan {
  id: string;
  userId: string;
  friendName: string;
  amount: number;
  currency: string;
  dateLoaned: Date;
  reason?: string;
  isPaid: boolean;
  lastReminderSent?: Date;
  reminderCount: number;
  createdAt: Date;
  updatedAt: Date;
  // Contact info for direct messaging
  phoneNumber?: string;
  email?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface ReminderTemplate {
  id: string;
  message: string;
  tone: 'casual' | 'friendly' | 'gentle';
}

export interface CreateLoanData {
  friendName: string;
  amount: number;
  currency: string;
  dateLoaned: Date;
  reason?: string;
  // Contact info for direct messaging
  phoneNumber?: string;
  email?: string;
}

export interface SubscriptionTier {
  id: 'free' | 'premium';
  name: string;
  features: string[];
  price: number;
}
