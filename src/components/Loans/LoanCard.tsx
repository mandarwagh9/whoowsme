import React from 'react';
import { Loan } from '@/types';
import { getDaysSinceLoan, shouldSendReminder, getReminderStatus } from '@/services/reminderService';
import { markAsPaid, deleteLoan } from '@/services/loanService';
import { format } from 'date-fns';
import { Send, CheckCircle, Trash2, Calendar, Clock } from 'lucide-react';

interface LoanCardProps {
  loan: Loan;
  onSendReminder: (loan: Loan) => void;
  onUpdate: () => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onSendReminder, onUpdate }) => {
  const daysSince = getDaysSinceLoan(loan.dateLoaned);
  const canSendReminder = shouldSendReminder(loan);
  const status = getReminderStatus(loan);

  const handleMarkPaid = async () => {
    if (window.confirm(`Mark ${loan.friendName}'s loan as paid?`)) {
      try {
        await markAsPaid(loan.id);
        onUpdate();
      } catch (error) {
        alert('Failed to mark as paid');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete ${loan.friendName}'s loan?`)) {
      try {
        await deleteLoan(loan.id);
        onUpdate();
      } catch (error) {
        alert('Failed to delete loan');
      }
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹'
    };
    return symbols[currency] || currency;
  };

  return (
    <div className={`card ${loan.isPaid ? 'opacity-60' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-1">{loan.friendName}</h3>
          {loan.reason && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic">"{loan.reason}"</p>
          )}
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
            {getCurrencySymbol(loan.currency)}{loan.amount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar size={16} />
          <span>{format(loan.dateLoaned, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Clock size={16} />
          <span>{daysSince} day{daysSince !== 1 ? 's' : ''} ago</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
        <span className={`text-xs sm:text-sm font-semibold ${
          loan.isPaid ? 'text-green-600 dark:text-green-400' : 
          canSendReminder ? 'text-primary-600 dark:text-primary-400' : 
          'text-gray-600 dark:text-gray-400'
        }`}>
          {status}
        </span>
      </div>

      {loan.reminderCount > 0 && !loan.isPaid && (
        <div className="mb-4 p-2 bg-soft-yellow dark:bg-yellow-900/30 rounded-lg text-xs text-gray-700 dark:text-gray-300">
          📨 {loan.reminderCount} reminder{loan.reminderCount !== 1 ? 's' : ''} sent
          {loan.lastReminderSent && ` (last: ${format(loan.lastReminderSent, 'MMM d')})`}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        {!loan.isPaid && (
          <>
            <button
              onClick={() => onSendReminder(loan)}
              disabled={!canSendReminder}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-full font-medium text-sm transition-all ${
                canSendReminder
                  ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
              <span className="hidden sm:inline">Remind</span>
              <span className="sm:hidden">Send</span>
            </button>
            <button
              onClick={handleMarkPaid}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-full font-medium text-sm bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle size={16} />
              Paid
            </button>
          </>
        )}
        {loan.isPaid && (
          <div className="flex-1 text-center py-2 px-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-semibold text-sm">
            ✅ Paid Back
          </div>
        )}
        <button
          onClick={handleDelete}
          className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          title="Delete loan"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default LoanCard;
