import { Loan, ReminderTemplate } from '@/types';
import { differenceInDays, format } from 'date-fns';

export const reminderTemplates: ReminderTemplate[] = [
  {
    id: '1',
    message: "Hey {name}! 😊 Hope you're doing well! Just a friendly reminder about the ${amount} I lent you on {date}. No rush at all, just wanted to check in!",
    tone: 'casual',
  },
  {
    id: '2',
    message: "Hi {name}! 👋 Quick heads up - I have that ${amount} from {date} on my books. Whenever you get a chance to settle it would be great!",
    tone: 'friendly',
  },
  {
    id: '3',
    message: "Hey {name}, hope all is well! 🙂 I wanted to gently remind you about the ${amount} from {date}. I know things get busy - just let me know when works for you!",
    tone: 'gentle',
  },
  {
    id: '4',
    message: "Hi {name}! 💙 Reaching out about the ${amount} we discussed on {date}. No pressure, just wanted to circle back. Thanks for understanding!",
    tone: 'friendly',
  },
  {
    id: '5',
    message: "Hey {name}! 😊 I hope you've been good! This is a gentle nudge about the ${amount} from {date}. Totally get that life gets hectic - whenever you can!",
    tone: 'gentle',
  },
];

export const generateReminderMessage = (loan: Loan, templateId?: string): string => {
  const template = templateId 
    ? reminderTemplates.find(t => t.id === templateId) || reminderTemplates[0]
    : reminderTemplates[Math.floor(Math.random() * reminderTemplates.length)];

  const dateStr = format(loan.dateLoaned, 'MMM d, yyyy');
  
  let message = template.message
    .replace('{name}', loan.friendName)
    .replace('${amount}', `$${loan.amount}`)
    .replace('{date}', dateStr);

  if (loan.reason) {
    message += ` (${loan.reason})`;
  }

  return message;
};

export const shouldSendReminder = (loan: Loan): boolean => {
  if (loan.isPaid) return false;
  
  const daysSinceLoan = differenceInDays(new Date(), loan.dateLoaned);
  
  // Don't send reminder in first 3 days
  if (daysSinceLoan < 3) return false;
  
  // Max 3 reminders
  if (loan.reminderCount >= 3) return false;
  
  // If never sent, and it's been 3+ days
  if (!loan.lastReminderSent && daysSinceLoan >= 3) return true;
  
  // If last reminder was 2+ days ago (changed from 5 for better follow-up)
  if (loan.lastReminderSent) {
    const daysSinceLastReminder = differenceInDays(new Date(), loan.lastReminderSent);
    return daysSinceLastReminder >= 2;
  }
  
  return false;
};

export const getDaysSinceLoan = (dateLoaned: Date): number => {
  return differenceInDays(new Date(), dateLoaned);
};

export const getDaysSinceLastReminder = (lastReminderSent?: Date): number | null => {
  if (!lastReminderSent) return null;
  return differenceInDays(new Date(), lastReminderSent);
};

export const getReminderStatus = (loan: Loan): string => {
  if (loan.isPaid) return 'Paid ✅';
  
  if (shouldSendReminder(loan)) {
    return 'Ready to send 📨';
  }
  
  if (loan.reminderCount >= 3) {
    return 'Max reminders sent';
  }
  
  const daysSinceLoan = getDaysSinceLoan(loan.dateLoaned);
  if (daysSinceLoan < 3) {
    return `Wait ${3 - daysSinceLoan} more day${3 - daysSinceLoan > 1 ? 's' : ''}`;
  }
  
  if (loan.lastReminderSent) {
    const daysSinceReminder = getDaysSinceLastReminder(loan.lastReminderSent);
    if (daysSinceReminder !== null && daysSinceReminder < 2) {
      return `Next reminder in ${2 - daysSinceReminder} day${2 - daysSinceReminder > 1 ? 's' : ''}`;
    }
  }
  
  return 'Pending';
};

// Generate WhatsApp deep link
export const getWhatsAppLink = (phoneNumber: string, message: string): string => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

// Generate SMS link
export const getSMSLink = (phoneNumber: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `sms:${phoneNumber}?body=${encodedMessage}`;
};

// Generate Email link
export const getEmailLink = (email: string, friendName: string, message: string): string => {
  const subject = encodeURIComponent(`Quick reminder - ${friendName}`);
  const body = encodeURIComponent(message);
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

// Generate email template for manual sending
export const generateEmailTemplate = (loan: Loan): { subject: string; body: string } => {
  const dateStr = format(loan.dateLoaned, 'MMM d, yyyy');
  return {
    subject: `Friendly reminder about the money from ${dateStr}`,
    body: `Hi ${loan.friendName},

Hope you're doing well! 😊

I wanted to send a quick, friendly reminder about the ${loan.currency === 'INR' ? '₹' : '$'}${loan.amount} from ${dateStr}${loan.reason ? ` (${loan.reason})` : ''}.

No rush at all - just wanted to check in! Let me know when works for you.

Thanks so much!`
  };
};
