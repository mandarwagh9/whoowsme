# Firestore Setup Instructions

## Quick Fix for "Missing or insufficient permissions"

### Option 1: Use Test Mode (Fastest - For Development Only)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **whoowsme**
3. Click **Firestore Database** in the left sidebar
4. If database doesn't exist:
   - Click **Create database**
   - Choose **Start in test mode** (allows all reads/writes for 30 days)
   - Select a location (e.g., us-central)
   - Click **Enable**

5. If database exists but has restrictive rules:
   - Click the **Rules** tab
   - Replace with these temporary rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   - Click **Publish**

### Option 2: Deploy Secure Rules (Recommended for Production)

1. **Initialize Firebase in your project:**
   ```powershell
   cd C:\whoowsme
   firebase login
   firebase init firestore
   ```
   - Select existing project: **whoowsme**
   - Use `firestore.rules` as your rules file
   - Press Enter for default Firestore indexes file

2. **Deploy the rules:**
   ```powershell
   firebase deploy --only firestore:rules
   ```

3. **Restart your dev server:**
   ```powershell
   npm run dev
   ```

## Verify It's Working

After setting up rules, try these steps in your app:
1. Sign in with Google or Email
2. Click "Add New Loan"
3. Fill in the form and submit
4. You should see the loan appear on your dashboard

## Security Rules Explanation

**Development Rules** (`firestore.rules.dev`):
- ✅ Any authenticated user can read/write any document
- ⚠️ NOT secure for production
- ⏰ Perfect for quick testing

**Production Rules** (`firestore.rules`):
- ✅ Users can only access their own loans
- ✅ Data is scoped by `userId`
- ✅ Safe for public deployment

## Troubleshooting

**Still getting permission errors?**

1. **Check if you're authenticated:**
   - Open browser DevTools → Console
   - Look for Firebase auth errors
   - Make sure you signed in successfully

2. **Check Firestore is enabled:**
   - Firebase Console → Firestore Database
   - Should show database with rules, not "Get started"

3. **Check environment variables:**
   - Make sure `.env.local` exists with your Firebase config
   - Restart dev server after creating `.env.local`

4. **Clear browser data:**
   - Sometimes cached auth state causes issues
   - Try incognito/private window

## Need Help?

Run this to check your setup:
```powershell
# Check if Firebase CLI is installed
firebase --version

# Check if logged in
firebase login

# Check current project
firebase projects:list
```
