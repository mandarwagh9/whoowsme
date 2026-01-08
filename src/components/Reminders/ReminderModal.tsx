import React, { useState } from 'react';
import { Loan } from '@/types';
import { generateReminderMessage, reminderTemplates } from '@/services/reminderService';
import { recordReminderSent } from '@/services/loanService';
import { X, Send, RefreshCw, Copy, Check } from 'lucide-react';

interface ReminderModalProps {
  loan: Loan;
  isOpen: boolean;
  onClose: () => void;
  onReminderSent: () => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ loan, isOpen, onClose, onReminderSent }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(reminderTemplates[0].id);
  const [message, setMessage] = useState(generateReminderMessage(loan, reminderTemplates[0].id));
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setMessage(generateReminderMessage(loan, templateId));
    setCopied(false);
  };

  const handleRefresh = () => {
    setMessage(generateReminderMessage(loan, selectedTemplate));
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSend = async () => {
    try {
      setSending(true);
      await recordReminderSent(loan.id);
      onReminderSent();
      onClose();
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    } finally {
      setSending(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Send Reminder 📨</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="bg-soft-blue dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{loan.friendName}</p>
                <p className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {getCurrencySymbol(loan.currency)}{loan.amount}
                </p>
              </div>
              <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                {loan.reason && <p className="italic">"{loan.reason}"</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose Tone
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {reminderTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {template.tone.charAt(0).toUpperCase() + template.tone.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview Message
              </label>
              <button
                onClick={handleRefresh}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
              >
                <RefreshCw size={16} />
                Regenerate
              </button>
            </div>
            <div className="bg-soft-green dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{message}</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              💡 <strong>Pro tip:</strong> Copy the message and send it via WhatsApp, SMS, or any messaging app. 
              The reminder will be logged automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy Message'}
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={20} />
              {sending ? 'Logging...' : 'Mark as Sent'}
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Reminder #{loan.reminderCount + 1} • You can send up to 3 reminders
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
