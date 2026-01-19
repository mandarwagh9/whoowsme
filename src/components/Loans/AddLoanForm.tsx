import React, { useState } from 'react';
import { CreateLoanData } from '@/types';
import { createLoan } from '@/services/loanService';
import { X, DollarSign, Calendar, User, FileText, Phone, Mail, Sparkles } from 'lucide-react';

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
    phoneNumber: '',
    email: '',
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-purple to-accent-cyan opacity-90"></div>
          <div className="relative flex justify-between items-center p-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Sparkles size={24} />
                Add New Entry
              </h2>
              <p className="text-white/80 text-sm mt-1">Track money you've lent</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-sm animate-slide-up">
              {error}
            </div>
          )}

          {/* Friend's Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <User size={16} className="text-primary-500" />
              Friend's Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.friendName}
              onChange={(e) => setFormData({ ...formData, friendName: e.target.value })}
              className="input-field"
              placeholder="e.g., Rahul"
              required
              disabled={loading}
            />
          </div>

          {/* Amount + Currency */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <DollarSign size={16} className="text-primary-500" />
              Amount <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-3">
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
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Calendar size={16} className="text-primary-500" />
              Date Loaned <span className="text-red-400">*</span>
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

          {/* Reason */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <FileText size={16} className="text-primary-500" />
              Reason <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-field"
              placeholder="e.g., Movie tickets, Lunch"
              disabled={loading}
            />
          </div>

          {/* Divider */}
          <div className="divider-gradient my-6"></div>

          {/* Contact Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Info for Quick Reminders</h3>
              <span className="text-xs text-gray-400">(Optional)</span>
            </div>
            
            {/* Phone Number */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Phone size={14} className="text-green-500" />
                WhatsApp / Phone
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="input-field"
                placeholder="+91 98765 43210"
                disabled={loading}
              />
              <p className="text-xs text-gray-400">Include country code for WhatsApp (e.g., +91)</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Mail size={14} className="text-red-400" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="friend@email.com"
                disabled={loading}
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-4 bg-gradient-to-r from-soft-blue/50 to-soft-purple/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              🔒 <strong>100% Private</strong> — Only you can see this. Your friend won't know until you send a reminder.
            </p>
          </div>

          {/* Action Buttons */}
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
              className="flex-1 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Adding...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Add Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLoanForm;
