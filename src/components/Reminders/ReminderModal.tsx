import React, { useState } from 'react';
import { Loan } from '@/types';
import { 
  generateReminderMessage, 
  reminderTemplates, 
  getWhatsAppLink, 
  getSMSLink, 
  getEmailLink,
  generateEmailTemplate 
} from '@/services/reminderService';
import { recordReminderSent } from '@/services/loanService';
import { X, Send, RefreshCw, Copy, Check, MessageCircle, Mail, Smartphone, Sparkles, Crown } from 'lucide-react';

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
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);

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

  const handleWhatsApp = () => {
    if (loan.phoneNumber) {
      window.open(getWhatsAppLink(loan.phoneNumber, message), '_blank');
    } else {
      // Open WhatsApp with just message for manual contact selection
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleSMS = () => {
    if (loan.phoneNumber) {
      window.location.href = getSMSLink(loan.phoneNumber, message);
    } else {
      window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    }
  };

  const handleEmail = () => {
    if (loan.email) {
      window.location.href = getEmailLink(loan.email, loan.friendName, message);
    } else {
      const emailTemplate = generateEmailTemplate(loan);
      window.location.href = `mailto:?subject=${encodeURIComponent(emailTemplate.subject)}&body=${encodeURIComponent(message)}`;
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return symbols[currency] || currency;
  };

  const emailTemplate = generateEmailTemplate(loan);

  const toneEmojis: Record<string, string> = {
    casual: '😊',
    friendly: '🤝', 
    gentle: '💛'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-teal"></div>
          <div className="relative flex justify-between items-center p-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Send Reminder</h2>
              <p className="text-white/80 text-sm mt-1">Choose how to remind {loan.friendName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Loan Summary Card */}
          <div className="card-gradient flex justify-between items-center">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Reminding</p>
              <p className="font-display font-bold text-xl text-gray-800 dark:text-white">{loan.friendName}</p>
              {loan.reason && (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic mt-1">"{loan.reason}"</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-3xl bg-gradient-to-r from-primary-500 to-accent-purple bg-clip-text text-transparent">
                {getCurrencySymbol(loan.currency)}{loan.amount}
              </p>
              {(loan.phoneNumber || loan.email) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {loan.phoneNumber && `📱 ${loan.phoneNumber}`}
                  {loan.phoneNumber && loan.email && ' • '}
                  {loan.email && `✉️ ${loan.email}`}
                </p>
              )}
            </div>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Choose Message Tone
            </label>
            <div className="grid grid-cols-3 gap-3">
              {reminderTemplates.slice(0, 3).map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`p-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? 'bg-accent-blue text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-2xl block mb-1">{toneEmojis[template.tone]}</span>
                  {template.tone.charAt(0).toUpperCase() + template.tone.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Message Preview
              </label>
              <button
                onClick={handleRefresh}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1.5 text-sm font-medium transition-colors"
              >
                <RefreshCw size={14} />
                Regenerate
              </button>
            </div>
            <div className="relative bg-soft-blue dark:bg-blue-900/10 p-5 rounded-lg border border-blue-200 dark:border-blue-800/30">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Quick Send Actions */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Quick Send via
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleWhatsApp}
                className="btn-whatsapp flex items-center justify-center gap-2 py-3"
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
              <button
                onClick={handleSMS}
                className="btn-sms flex items-center justify-center gap-2 py-3"
              >
                <Smartphone size={18} />
                SMS
              </button>
              <button
                onClick={handleEmail}
                className="btn-email flex items-center justify-center gap-2 py-3"
              >
                <Mail size={18} />
                Email
              </button>
            </div>
          </div>

          {/* Email Template Toggle */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={() => setShowEmailTemplate(!showEmailTemplate)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
            >
              <Mail size={16} />
              {showEmailTemplate ? 'Hide' : 'Show'} Email Template for Manual Sending
            </button>
            
            {showEmailTemplate && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Subject</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{emailTemplate.subject}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Body</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{emailTemplate.body}</p>
                </div>
              </div>
            )}
          </div>

          {/* Premium Feature Banner */}
          <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/20 rounded-lg p-4 border border-slate-200 dark:border-slate-700/30">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-700 rounded-lg shadow-md">
                <Crown size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Auto-Send Reminders</h4>
                  <span className="badge-premium">
                    <Sparkles size={10} />
                    Premium
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically send reminders via WhatsApp, SMS & Email on schedule. Never forget to follow up!
                </p>
                <button className="mt-3 text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  Coming Soon →
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Message'}
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 btn-gradient flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {sending ? 'Logging...' : 'Mark as Sent'}
            </button>
          </div>

          {/* Footer Info */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Reminder #{loan.reminderCount + 1} of 3 • Next reminder available in 2 days after sending
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
