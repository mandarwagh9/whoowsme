import { collection, addDoc, updateDoc, doc, query, where, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Loan, CreateLoanData } from '@/types';

const LOANS_COLLECTION = 'loans';

export const createLoan = async (userId: string, loanData: CreateLoanData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, LOANS_COLLECTION), {
      userId,
      friendName: loanData.friendName,
      amount: loanData.amount,
      currency: loanData.currency,
      dateLoaned: Timestamp.fromDate(loanData.dateLoaned),
      reason: loanData.reason || '',
      isPaid: false,
      reminderCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw error;
  }
};

export const getUserLoans = async (userId: string): Promise<Loan[]> => {
  try {
    // Simple query without orderBy to avoid needing a composite index
    const q = query(
      collection(db, LOANS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const loans: Loan[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      loans.push({
        id: doc.id,
        userId: data.userId,
        friendName: data.friendName,
        amount: data.amount,
        currency: data.currency,
        dateLoaned: data.dateLoaned.toDate(),
        reason: data.reason,
        isPaid: data.isPaid,
        lastReminderSent: data.lastReminderSent?.toDate(),
        reminderCount: data.reminderCount || 0,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });
    
    // Sort in memory instead of in the query (no index needed)
    loans.sort((a, b) => b.dateLoaned.getTime() - a.dateLoaned.getTime());
    
    return loans;
  } catch (error) {
    console.error('Error getting loans:', error);
    throw error;
  }
};

export const markAsPaid = async (loanId: string): Promise<void> => {
  try {
    const loanRef = doc(db, LOANS_COLLECTION, loanId);
    await updateDoc(loanRef, {
      isPaid: true,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking loan as paid:', error);
    throw error;
  }
};

export const recordReminderSent = async (loanId: string): Promise<void> => {
  try {
    const loanRef = doc(db, LOANS_COLLECTION, loanId);
    const loanDoc = await getDocs(query(collection(db, LOANS_COLLECTION), where('__name__', '==', loanId)));
    
    let currentCount = 0;
    loanDoc.forEach((doc) => {
      currentCount = doc.data().reminderCount || 0;
    });
    
    await updateDoc(loanRef, {
      lastReminderSent: Timestamp.now(),
      reminderCount: currentCount + 1,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error recording reminder:', error);
    throw error;
  }
};

export const deleteLoan = async (loanId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, LOANS_COLLECTION, loanId));
  } catch (error) {
    console.error('Error deleting loan:', error);
    throw error;
  }
};
