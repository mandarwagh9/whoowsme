import React from 'react';
import { Loan } from '@/types';
import { getDaysSinceLoan, shouldSendReminder, getReminderStatus } from '@/services/reminderService';
import { markAsPaid, deleteLoan } from '@/services/loanService';
import { format } from 'date-fns';
import { Send, CheckCircle, Trash2, Calendar, Clock, Phone, Mail, Sparkles } from 'lucide-react';

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
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return symbols[currency] || currency;
  };

  const getStatusColor = () => {
    if (loan.isPaid) return 'from-green-50 to-emerald-50';
    if (canSendReminder) return 'from-blue-50 to-teal-50';
    return 'from-gray-50 to-gray-100';
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02] ${
        loan.isPaid ? 'opacity-70' : ''
      }`}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor()} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      {/* Card content */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-5 sm:p-6 border border-white/30 dark:border-gray-700/50 rounded-3xl shadow-glass">
        
        {/* Top section - Name and Amount */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-display font-bold text-gray-800 dark:text-white truncate">
                {loan.friendName}
              </h3>
              {canSendReminder && !loan.isPaid && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <Sparkles size={10} />
                  Ready
                </span>
              )}
            </div>
            {loan.reason && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1 truncate">"{loan.reason}"</p>
            )}
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-2xl sm:text-3xl font-display font-bold text-accent-blue">
              {getCurrencySymbol(loan.currency)}{loan.amount}
            </p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
            <Calendar size={16} className="text-accent-blue" />
            <span className="text-sm">{format(loan.dateLoaned, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
            <Clock size={16} className="text-accent-teal" />
            <span className="text-sm">{daysSince} day{daysSince !== 1 ? 's' : ''} ago</span>
          </div>
        </div>

        {/* Contact info if available */}
        {(loan.phoneNumber || loan.email) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {loan.phoneNumber && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
                <Phone size={12} />
                {loan.phoneNumber}
              </span>
            )}
            {loan.email && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
                <Mail size={12} />
                {loan.email}
              </span>
            )}
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
          <span className={`text-sm font-semibold ${
            loan.isPaid ? 'text-green-600 dark:text-green-400' : 
            canSendReminder ? 'text-accent-blue dark:text-accent-blue' : 
            'text-gray-600 dark:text-gray-400'
          }`}>
            {status}
          </span>
        </div>

        {/* Reminder history */}
        {loan.reminderCount > 0 && !loan.isPaid && (
          <div className="mb-4 p-3 bg-soft-blue dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              📨 {loan.reminderCount} reminder{loan.reminderCount !== 1 ? 's' : ''} sent
              {loan.lastReminderSent && (
                <span className="text-gray-500 dark:text-gray-400">
                  {' '}• Last: {format(loan.lastReminderSent, 'MMM d')}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {!loan.isPaid && (
            <>
              <button
                onClick={() => onSendReminder(loan)}
                disabled={!canSendReminder}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  canSendReminder
                    ? 'bg-accent-blue hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={16} />
                <span>Remind</span>
              </button>
              <button
                onClick={handleMarkPaid}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <CheckCircle size={16} />
                <span>Paid</span>
              </button>
            </>
          )}
          {loan.isPaid && (
            <div className="flex-1 text-center py-2.5 px-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-semibold text-sm border border-green-200 dark:border-green-800/30">
              ✅ Paid Back
            </div>
          )}
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            title="Delete loan"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCard;
