# Who Owes Me? - Feature Specification

## Product Overview
A privacy-first web application that helps users track informal loans to friends and send polite, automated reminders without social awkwardness.

---

## Feature Breakdown

### 1. Authentication System
**Priority:** P0 (MVP Blocker)

**Features:**
- Google OAuth Sign-In
- Email/Password Authentication
- Persistent sessions
- Secure logout

**Technical:**
- Firebase Authentication
- Protected routes with React Router
- Auth context for global state

---

### 2. Dashboard
**Priority:** P0 (MVP Blocker)

**Components:**
- Summary stats cards (Total Owed, Active Loans, Friend Count)
- Active loans section
- Paid loans section (collapsed by default)
- Add loan button

**Data Displayed:**
- Total amount owed across all active loans
- Number of active vs paid loans
- Unique friend count
- Individual loan cards with key info

**Technical:**
- Real-time Firestore queries
- Responsive grid layout (1/2/3 columns)
- Loading states and empty states

---

### 3. Loan Management
**Priority:** P0 (MVP Blocker)

#### 3.1 Add Loan
**Fields:**
- Friend's name (required, text)
- Amount (required, number, min: 0.01)
- Currency (dropdown: USD, EUR, GBP, INR)
- Date loaned (date picker, max: today)
- Reason (optional, text, max 100 chars)

**Validation:**
- All required fields must be filled
- Amount must be positive
- Date cannot be in future
- Name must be non-empty

#### 3.2 Loan Card
**Displays:**
- Friend name
- Amount with currency symbol
- Date loaned (formatted)
- Days since loan
- Payment status
- Reminder count and last sent date
- Action buttons

**Actions:**
- Send Reminder (disabled if conditions not met)
- Mark as Paid
- Delete loan

**Status Indicators:**
- "Paid ✅" - Loan settled
- "Ready to send 📨" - Can send reminder now
- "Wait X days" - Too soon to remind
- "Next reminder in X days" - Cooling period
- "Max reminders sent" - Hit limit

---

### 4. Smart Reminder System
**Priority:** P0 (MVP Blocker)

#### 4.1 Reminder Logic
**Rules:**
1. No reminder in first 3 days after loan
2. First reminder available after 3 days
3. Subsequent reminders every 5 days
4. Maximum 3 reminders per loan
5. No reminders for paid loans

**Calculation:**
```
canSendReminder = 
  !isPaid &&
  daysSinceLoan >= 3 &&
  reminderCount < 3 &&
  (lastReminderSent == null || daysSinceLastReminder >= 5)
```

#### 4.2 Message Templates
**Tone Options:** Casual, Friendly, Gentle

**Template Variables:**
- `{name}` - Friend's name
- `${amount}` - Dollar amount
- `{date}` - Formatted loan date
- `{reason}` - Optional context

**Templates:** 5 pre-written messages with emojis

#### 4.3 Reminder Modal
**Features:**
- Tone selector (3 options)
- Live message preview
- Regenerate button (random template)
- Copy to clipboard button
- "Mark as Sent" button
- Shows reminder number (e.g., "Reminder #2")
- Pro tip: suggests manual sending via WhatsApp/SMS

**Flow:**
1. User clicks "Remind" on loan card
2. Modal opens with preview
3. User selects tone or regenerates
4. User copies message
5. User sends manually via preferred app
6. User clicks "Mark as Sent"
7. System logs reminder timestamp and increments count

---

### 5. Data Model

#### Loans Collection
```typescript
{
  id: string;                    // Firestore auto-generated
  userId: string;                // Firebase UID
  friendName: string;            // Max 50 chars
  amount: number;                // Positive float
  currency: string;              // ISO code
  dateLoaned: Timestamp;         // Date object
  reason?: string;               // Optional, max 100 chars
  isPaid: boolean;               // Default: false
  lastReminderSent?: Timestamp;  // Null if never sent
  reminderCount: number;         // Default: 0, max: 3
  createdAt: Timestamp;          // Record creation
  updatedAt: Timestamp;          // Last modification
}
```

#### Firestore Indexes
- `userId` (ascending)
- `dateLoaned` (descending)
- Composite: `userId + isPaid + dateLoaned`

---

### 6. UI/UX Design System

#### Color Palette
**Primary:**
- Blue: #0ea5e9 (primary-500)
- Hover: #0284c7 (primary-600)

**Soft Backgrounds:**
- Green: #d4f4dd
- Blue: #e3f2fd
- Peach: #ffe4e1
- Yellow: #fff9c4

**Status Colors:**
- Success: Green (#22c55e)
- Warning: Yellow (#fbbf24)
- Danger: Red (#ef4444) - use sparingly
- Gray: Neutral (#6b7280)

#### Typography
- Font: System fonts (Apple/Segoe UI/Roboto)
- Headers: Bold, 24-32px
- Body: Regular, 14-16px
- Small: 12-14px

#### Components
**Cards:**
- Background: White
- Border radius: 16px (rounded-card)
- Shadow: Medium on hover
- Padding: 24px

**Buttons:**
- Primary: Blue gradient, white text, rounded-full
- Secondary: White, gray text, border, rounded-full
- Danger: Red, for delete only
- Disabled: Gray, reduced opacity

**Inputs:**
- Border: Gray 300
- Focus: Blue ring
- Rounded: 8px
- Padding: 8px 16px

**Emojis Used:**
- 😊 General happiness
- 👋 Greeting
- 💰 Money
- 📨 Reminder
- ✅ Paid/Success
- 🔒 Privacy
- 💙 Friendly
- 🙂 Gentle

#### Responsive Breakpoints
- Mobile: < 640px (1 column)
- Tablet: 640-1024px (2 columns)
- Desktop: > 1024px (3 columns)

---

### 7. Security & Privacy

**Authentication:**
- Firebase Auth required for all routes
- User-scoped data queries
- No public access

**Firestore Rules:**
```javascript
// Users can only access their own loans
allow read, write: if request.auth.uid == resource.data.userId;
```

**Privacy Features:**
- No social/public profiles
- No friend lists or connections
- No loan sharing or visibility
- All reminders private
- No push notifications (user-initiated only)

---

### 8. Performance Optimization

**Loading States:**
- Skeleton screens on dashboard
- Spinner on auth
- Button loading states

**Caching:**
- Firebase offline persistence
- React memo for loan cards
- Debounced search (future)

**Bundle Size:**
- Code splitting by route
- Lazy load modals
- Tree-shaking with Vite

---

### 9. Error Handling

**User-Facing Errors:**
- Form validation errors (inline, red text)
- Network errors (toast/banner)
- Auth errors (below login form)
- Delete confirmations (native confirm dialog)

**Technical Errors:**
- Console logging for debugging
- Firestore error catching
- Fallback UI for crashes

---

### 10. Future Enhancements (Post-MVP)

**Phase 2:**
- WhatsApp Business API integration
- Email reminders via SendGrid
- Multi-currency with live conversion
- Payment links (Venmo, PayPal, Zelle)
- Recurring loans (subscriptions)

**Phase 3:**
- AI-generated personalized messages
- Group expense splitting
- Receipt upload with OCR
- Analytics dashboard
- Export to CSV/PDF

---

## Demo Script (1 Minute)

**Setup (5s):**
"This is Who Owes Me - tracking loans without losing friends."

**Problem (10s):**
"Show of hands: who's lent money to a friend but felt too awkward to ask for it back? Exactly. Money ruins friendships."

**Solution (15s):**
[Show dashboard] "Add a loan - name, amount, date, optional reason. The app tracks it privately."

**Key Feature (20s):**
[Click Remind] "After 3 days, you can send a polite reminder. Choose the tone - casual, friendly, or gentle. Preview the message, copy it, send it yourself via WhatsApp or text."

**Privacy (5s):**
"No public shaming. No social features. Just you and your data."

**Close (5s):**
"Who Owes Me - because friendships are worth more than money."

---

## Success Metrics (Post-Launch)

**User Engagement:**
- Daily active users
- Loans created per user
- Reminders sent per loan
- Paid loan rate

**Product Quality:**
- Time to first loan
- Reminder send rate
- User retention (7-day, 30-day)
- Error rate

**Business:**
- Sign-up conversion rate
- Feature usage (which tones most popular)
- Mobile vs desktop usage
