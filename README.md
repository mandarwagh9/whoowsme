# Who Owes Me? 😊

A polite, privacy-first web application to track informal loans and send gentle reminders to friends without awkwardness.

## 🎯 Problem & Solution

**Problem:** People avoid asking friends for money they're owed because it feels uncomfortable and can harm relationships.

**Solution:** Track informal loans and send automated, polite reminder messages privately - so friendships stay intact.

## 🎤 10-Second Pitch

*"People don't ask friends for money because it feels awkward. Our web app tracks informal loans and sends polite reminders automatically—so friendships stay intact."*

## ✨ Features

- **🔐 Privacy-First:** No public exposure, no shaming - only private reminders
- **📨 Smart Reminders:** Auto-generated polite messages with customizable tones
- **💰 Loan Tracking:** Track who owes what, when it was lent, and for what reason
- **📊 Dashboard:** Beautiful overview of active loans, total owed, and payment status
- **📱 Mobile-First:** Responsive design that works perfectly on any device
- **🎨 Friendly UI:** Soft colors, rounded cards, subtle emojis - no aggressive alerts

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase
  - Authentication (Google + Email)
  - Firestore Database
- **Icons:** Lucide React
- **Date Handling:** date-fns

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Google + Email/Password)
3. Create a Firestore database
4. Copy `.env.local.example` to `.env.local`
5. Add your Firebase credentials to `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Security Rules

Add these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /loans/{loanId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Run Development Server

```bash
npm run dev
```

App will open at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm run preview
```

## 📚 Database Schema

### Loans Collection

```typescript
{
  id: string;              // Auto-generated
  userId: string;          // Owner's Firebase UID
  friendName: string;      // Friend's name
  amount: number;          // Amount owed
  currency: string;        // USD, EUR, GBP, INR, etc.
  dateLoaned: Timestamp;   // When money was lent
  reason?: string;         // Optional reason
  isPaid: boolean;         // Payment status
  lastReminderSent?: Timestamp;  // Last reminder date
  reminderCount: number;   // Number of reminders sent
  createdAt: Timestamp;    // Record creation
  updatedAt: Timestamp;    // Last update
}
```

## 🔔 Reminder Logic

- **Wait Period:** First reminder sent after 3 days
- **Frequency:** Every 5 days after first reminder
- **Limit:** Maximum 3 reminders per loan
- **Tone Options:** Casual, Friendly, Gentle
- **5 Templates:** Randomized or user-selected

### Sample Reminder Messages

1. *"Hey Alex! 😊 Hope you're doing well! Just a friendly reminder about the $50 I lent you on Jan 5. No rush at all, just wanted to check in!"*

2. *"Hi Alex! 👋 Quick heads up - I have that $50 from Jan 5 on my books. Whenever you get a chance to settle it would be great!"*

3. *"Hey Alex, hope all is well! 🙂 I wanted to gently remind you about the $50 from Jan 5. I know things get busy - just let me know when works for you!"*

## 🎨 UI/UX Highlights

- **Soft Color Palette:** Pastel blues, greens, peach, yellow
- **No Red Alerts:** Friendly, non-aggressive design
- **Rounded Cards:** 16px border radius throughout
- **Subtle Emojis:** 😊 🙂 💰 📨 ✅ enhance friendliness
- **Mobile-First:** Responsive grid layouts, touch-friendly buttons
- **Smooth Transitions:** Hover effects, loading states

## 📱 Pages & Components

### Pages
- **Login Page:** Google + Email authentication
- **Dashboard:** Loan overview, stats, loan cards

### Components
- **LoanCard:** Individual loan display with actions
- **AddLoanForm:** Modal form to create new loans
- **ReminderModal:** Preview and send reminder messages

### Services
- **authService:** Firebase authentication
- **loanService:** CRUD operations for loans
- **reminderService:** Message generation, scheduling logic

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

## 🎯 Hackathon Demo Tips

1. **Pre-seed Data:** Add 3-5 sample loans before demo
2. **Show Reminder Flow:** Demonstrate message preview → copy → send
3. **Highlight Privacy:** Emphasize no public shaming
4. **Mobile Demo:** Show responsive design on phone
5. **Quick Stats:** Point out total owed, active loans dashboard

## 📊 Feature Breakdown

### Phase 1 (MVP - Current)
- ✅ Authentication (Google + Email)
- ✅ Dashboard with loan tracking
- ✅ Add/Edit/Delete loans
- ✅ Smart reminder system
- ✅ 5 polite message templates
- ✅ Copy-to-clipboard functionality
- ✅ Mobile-responsive design

### Phase 2 (Future)
- 🔄 WhatsApp API integration
- 🔄 Email reminders via SendGrid
- 🔄 Multi-currency conversion
- 🔄 Payment integration (Venmo, PayPal)
- 🔄 Recurring loans
- 🔄 Export to CSV

### Phase 3 (Advanced)
- 🔄 AI-generated personalized messages
- 🔄 Group expense splitting
- 🔄 Receipt upload & OCR
- 🔄 Analytics dashboard

## 🤝 Contributing

This is a hackathon MVP. Contributions welcome!

## 📄 License

MIT License - feel free to use for your own projects!

## 💡 Built With

- React ⚛️
- TypeScript 📘
- Tailwind CSS 🎨
- Firebase 🔥
- Vite ⚡
- Love & Empathy 💙

---

**Remember:** Money shouldn't break friendships. Track it politely! 😊
