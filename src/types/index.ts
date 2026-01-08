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
}
