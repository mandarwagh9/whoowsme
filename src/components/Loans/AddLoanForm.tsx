import React, { useState } from 'react';
import { CreateLoanData } from '@/types';
import { createLoan } from '@/services/loanService';
import { X, DollarSign, Calendar, User, FileText } from 'lucide-react';

interface AddLoanFormProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onLoanAdded: () => void;
}

const AddLoanForm: React.FC<AddLoanFormProps> = ({ userId, isOpen, onClose, onLoanAdded }) => {
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getInitialFormData = (): CreateLoanData => ({
    friendName: '',
    amount: 0,
    currency: 'INR',
    dateLoaned: new Date(),
    reason: '',
  });

  const [formData, setFormData] = useState<CreateLoanData>(getInitialFormData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createLoan(userId, formData);
      
      setFormData(getInitialFormData());
      
      onLoanAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Add New Loan 💰</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <User size={16} className="inline mr-1" />
              Friend's Name *
            </label>
            <input
              type="text"
              value={formData.friendName}
              onChange={(e) => setFormData({ ...formData, friendName: e.target.value })}
              className="input-field"
              placeholder="e.g., Alex"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <DollarSign size={16} className="inline mr-1" />
              Amount *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="input-field flex-1"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input-field w-24"
                disabled={loading}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Calendar size={16} className="inline mr-1" />
              Date Loaned *
            </label>
            <input
              type="date"
              value={formatDateForInput(formData.dateLoaned)}
              onChange={(e) => {
                const dateValue = e.target.value;
                if (dateValue) {
                  const [year, month, day] = dateValue.split('-').map(Number);
                  setFormData({ ...formData, dateLoaned: new Date(year, month - 1, day) });
                }
              }}
              className="input-field"
              required
              disabled={loading}
              max={getTodayDateString()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FileText size={16} className="inline mr-1" />
              Reason (Optional)
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-field"
              placeholder="e.g., Concert tickets"
              disabled={loading}
            />
          </div>

          <div className="bg-soft-blue dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              🔒 This loan is private and will only be visible to you. 
              Your friend will only receive polite reminders that you choose to send.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLoanForm;
