# Supabase Configuration Steps
## Email Confirmation & Deep Linking Setup

**Date:** 2025-01-24
**Purpose:** Fix RLS policy blocking and configure email confirmation for mobile app

---

## Part 1: Apply Database Migration (CRITICAL - Do This First!)

### Step 1: Run the SQL Migration

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project
2. Navigate to **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Open the file: `supabase/migrations/20250124_fix_rls_profile_creation.sql`
5. Copy the entire contents and paste into the SQL Editor
6. Click **RUN** button (or press Ctrl+Enter)
7. Verify success message appears (no errors)

**What this does:**
- Drops the problematic INSERT policy that was blocking profile creation
- Creates a secure Postgres function `create_user_profile()` that bypasses RLS safely
- Adds security checks to prevent unauthorized access
- Grants execute permissions to authenticated and anonymous users

**Expected Output:**
```
Success. No rows returned
```

---

## Part 2: Configure Email Templates for Deep Linking

### Step 2: Update Email Confirmation Template

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Select **"Confirm signup"** template
3. Find this line in the template:
   ```
   {{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=signup&redirect_to={{ .RedirectTo }}
   ```

4. Replace it with:
   ```
   lomaapp://auth/confirm?token={{ .TokenHash }}&type=signup
   ```

5. The full template should look like this:
   ```html
   <h2>Confirm your signup</h2>

   <p>Follow this link to confirm your user:</p>
   <p><a href="lomaapp://auth/confirm?token={{ .TokenHash }}&type=signup">Confirm your email</a></p>
   ```

6. Click **Save**

---

## Part 3: Configure Redirect URLs

### Step 3: Add Allowed Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Find the **Redirect URLs** section
3. Add the following URLs (one per line):
   ```
   lomaapp://auth/confirm
   lomaapp://payment-complete
   lomaapp://reset-password
   lomaapp://settings
   ```

4. Click **Save**

**What this does:**
- Allows Supabase to redirect to your mobile app via deep links
- Prevents unauthorized redirect attacks

---

## Part 4: Configure Site URL (Optional but Recommended)

### Step 4: Set Site URL

1. Still in **Authentication** → **URL Configuration**
2. Find **Site URL** field
3. For development, you can leave it as `http://localhost:3000`
4. For production, set it to your website URL (e.g., `https://loma.app`)

**Note:** This is a fallback URL. The app will use deep links, so this isn't critical.

---

## Part 5: Verify Email Confirmation Settings

### Step 5: Check Email Confirmation Status

1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Verify that **"Confirm email"** is **CHECKED** (enabled)
4. This is what you want for production

**For Testing:**
- You can temporarily uncheck "Confirm email" to skip email verification during testing
- Remember to re-enable it before going to production!

---

## Part 6: Test the Changes

### Step 6: Test Complete Signup Flow

1. **Rebuild your app** (the app.config.js changes require a rebuild):
   ```bash
   # Stop the current dev server (Ctrl+C)
   npx expo start --clear --tunnel
   ```

2. **Delete the app** from your test device/emulator (to clear old session)

3. **Delete any existing test accounts** from Supabase:
   - Go to Supabase Dashboard → Authentication → Users
   - Delete any test user accounts
   - Go to Database → Table Editor → user_profiles
   - Delete corresponding profile rows

4. **Test the complete flow:**
   - Open app → Start onboarding
   - Complete all onboarding steps (name, stats, goals, etc.)
   - On PaymentScreen, select a plan, enter password, agree to terms
   - Click "Start Free Trial"
   - You should see the **EmailConfirmationScreen** (not an alert)
   - Check your email inbox
   - Click the confirmation link in the email
   - App should open automatically and show "Email Verified! 🎉"
   - Click "Continue" button
   - You should see the **PaymentCollectionScreen** with plan selection
   - Select your plan and click "Complete Payment & Start Free Trial"
   - Stripe payment sheet should appear
   - Enter test payment details (use Stripe test card: 4242 4242 4242 4242)
   - Complete payment
   - App should show "Welcome to LOMA! 🎉"
   - You should be logged in and see HomeScreen

---

## Troubleshooting

### Issue: "new row violates row-level security policy"
**Solution:** The SQL migration didn't run successfully. Go back to Part 1 and re-run the migration.

### Issue: Email link goes to localhost:3000
**Solution:** Email template not updated. Go back to Part 2 and update the template.

### Issue: Deep link doesn't open the app
**Solution:**
1. Make sure you rebuilt the app after updating app.config.js
2. Check that the scheme is configured correctly in app.config.js (line 18: `scheme: 'lomaapp'`)
3. On Android, may need to rebuild with `npx expo run:android`

### Issue: "Profile already exists" error
**Solution:** The user already has a profile from a previous signup attempt.
- Option 1: Use a different email for testing
- Option 2: Delete the profile from Supabase Dashboard → Table Editor → user_profiles

### Issue: Deep link opens app but nothing happens
**Solution:** Check the logs in your terminal. The deep link handler in RootNavigator.tsx should log messages. If you don't see them, the deep link might not be formatted correctly.

---

## Verification Checklist

After completing all steps, verify:

- [ ] SQL migration ran successfully in Supabase SQL Editor
- [ ] Email template updated to use `lomaapp://auth/confirm?token=...`
- [ ] Redirect URLs added in Supabase Authentication settings
- [ ] App rebuilt with new app.config.js changes
- [ ] Test signup shows EmailConfirmationScreen (not Alert)
- [ ] Email received with confirmation link
- [ ] Clicking email link opens app
- [ ] App shows "Email Verified! 🎉" message
- [ ] PaymentCollectionScreen appears after verification
- [ ] Stripe payment sheet appears when clicking "Complete Payment"
- [ ] Payment processes successfully with test card
- [ ] User is logged in and sees HomeScreen after payment

---

## What Changed in the Code

### Files Modified:
1. **supabase/migrations/20250124_fix_rls_profile_creation.sql** - New migration file
2. **src/services/user/userService.ts** - Now calls secure function instead of direct INSERT
3. **src/screens/auth/EmailConfirmationScreen.tsx** - New screen for email confirmation
4. **src/screens/onboarding/PaymentCollectionScreen.tsx** - New screen for post-verification payment
5. **src/navigation/OnboardingNavigator.tsx** - Added EmailConfirmation and PaymentCollection routes, dynamic initial route
6. **src/screens/onboarding/PaymentScreen.tsx** - Save selected plan to UserContext, navigate to EmailConfirmationScreen
7. **src/navigation/RootNavigator.tsx** - Added deep link handler for email confirmation, navigate to PaymentCollection after verification
8. **app.config.js** - Added scheme and intent filters for deep linking

---

## Next Steps

After testing successfully:

1. **For Production:**
   - Ensure email confirmation is ENABLED in Supabase
   - Use your production domain in email templates
   - Test on real devices (iOS and Android)

2. **Optional Improvements:**
   - Customize email template styling
   - Add more helpful text to EmailConfirmationScreen
   - Add analytics tracking for email confirmation events

---

## Support

If you encounter issues not covered in the troubleshooting section:
1. Check Supabase logs: Dashboard → Logs → All logs
2. Check app logs in terminal
3. Verify RLS policies in: Dashboard → Database → Policies
4. Check auth users in: Dashboard → Authentication → Users

---

*Last Updated: 2025-01-24*
