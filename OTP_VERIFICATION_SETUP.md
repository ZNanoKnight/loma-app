# OTP Verification Setup Guide

**Date:** 2025-01-24
**Purpose:** Replace deep link email confirmation with OTP (One-Time Password) code verification

---

## Why OTP Instead of Deep Links?

**Problems with deep links for email confirmation:**
- Custom URL schemes (`lomaapp://`) require standalone app builds (don't work in Expo Go)
- Email clients (especially Gmail) strip custom schemes for security
- Links are not clickable in email previews
- Universal Links require Apple Developer account + web server setup

**Benefits of OTP codes:**
- ✅ Works immediately in Expo Go (no rebuild needed)
- ✅ Works in all email clients
- ✅ Simple copy-paste or manual entry
- ✅ No deep linking or web server required
- ✅ More secure (time-limited codes)

---

## Step 1: Enable OTP in Supabase

### A. Enable Email OTP

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Click on **Email** provider
3. **IMPORTANT:** Make sure "Confirm email" is **CHECKED** ✅
4. Scroll down to **Email OTP Settings**:
   - **Enable Email OTP:** Check this box ✅
   - **OTP Expiry Duration:** 3600 seconds (1 hour) - recommended
   - **OTP Length:** 6 digits - recommended
5. Click **Save**

---

## Step 2: Update Supabase Email Template

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **"Confirm signup"** template
3. Replace the entire body with:

```html
<h2>Welcome to LOMA! 🎉</h2>

<p>Thanks for signing up! To complete your registration, please verify your email address.</p>

<h3>Your verification code is:</h3>

<div style="background-color: #F3F0FF; border: 2px solid #6B46C1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
  <p style="font-size: 48px; font-weight: bold; color: #6B46C1; letter-spacing: 8px; margin: 0; font-family: monospace;">
    {{ .Token }}
  </p>
</div>

<p style="color: #666; font-size: 14px; margin-top: 20px;">
  <strong>How to verify:</strong>
</p>
<ol style="color: #666; font-size: 14px; line-height: 1.8;">
  <li>Open the LOMA app</li>
  <li>Enter the 6-digit code above</li>
  <li>Click "Verify Code"</li>
</ol>

<p style="color: #999; font-size: 12px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
  This code will expire in 1 hour. If you didn't sign up for LOMA, you can safely ignore this email.
</p>

<p style="color: #999; font-size: 12px;">
  Need help? Contact us at support@loma.app
</p>
```

4. Click **Save**

**Important notes about the template:**
- `{{ .Token }}` is the Supabase variable for the OTP code
- The code is displayed in large, bold text for easy reading
- Instructions are clear and numbered
- Styling matches your app's purple theme

---

## Step 3: Test the Complete Flow

### Prerequisites:
1. Delete any existing test accounts from Supabase:
   - **Authentication** → **Users** → Delete user
   - **Table Editor** → `user_profiles` → Delete profile row
2. Make sure you've saved the Supabase email template changes

### Test Steps:

#### 1. Start the Expo server:
```bash
cd loma-app
npx expo start --clear --tunnel
```

#### 2. Complete onboarding in the app:
- Enter name, stats, goals, dietary preferences
- On PaymentScreen: Select plan, enter email & password
- Click "Start Free Trial"

#### 3. Check the email confirmation screen:
- Should see: "Check Your Email" screen
- Should show: "We've sent a 6-digit verification code to [email]"
- Should see: Large text input field for code entry

#### 4. Check your email:
- Open your email inbox
- Find email from Supabase (subject: "Confirm your signup")
- You should see a **large 6-digit code** displayed prominently
- Example: `123456`

#### 5. Enter the OTP code:
- Copy the 6-digit code from email
- Return to the app
- Paste or type the code in the input field
- The "Verify Code" button should become active when you enter 6 digits

#### 6. Verify the code:
- Click "Verify Code"
- Should see: "Email Verified! 🎉" alert
- Click "Continue"

#### 7. Complete payment:
- Should navigate to PaymentCollectionScreen
- Plan should be pre-selected
- Click "Complete Payment & Start Free Trial"
- Enter test card: `4242 4242 4242 4242`
- Complete payment

#### 8. Success:
- Should see: "Welcome to LOMA! 🎉" alert
- Click "Get Started"
- Should navigate to HomeScreen
- User is logged in and can use the app

---

## Step 4: Update Related Code (Already Done)

The following files have been updated:

### src/screens/auth/EmailConfirmationScreen.tsx
**Changes:**
- Added `otpCode` state for user input
- Added `TextInput` for 6-digit code entry
- Added `handleVerifyOTP()` function using `supabase.auth.verifyOtp()`
- Updated UI to show OTP input instead of "click link" instructions
- Updated button text: "Resend Email" → "Resend Code"
- **IMPORTANT:** Added session storage and UserContext update after verification

**Key code:**
```typescript
const { data, error } = await supabase.auth.verifyOtp({
  email: email,
  token: otpCode,
  type: 'signup',
});

if (data.user && data.session) {
  // Store session tokens
  await SecureStorage.setAccessToken(data.session.access_token);
  await SecureStorage.setRefreshToken(data.session.refresh_token);
  await SecureStorage.setUserId(data.user.id);

  // Update UserContext with authentication state
  updateUserData({
    isAuthenticated: true,
    userId: data.user.id,
    email: data.user.email || email,
  });
}
```

---

## Troubleshooting

### Code Not Working:

**Problem:** "Invalid or expired code" error

**Solutions:**
1. **Check code expiry:**
   - Codes expire after 1 hour (default)
   - Request a new code by clicking "Resend Code"

2. **Verify email matches:**
   - The email you signed up with must match exactly
   - Check for typos in the email address

3. **Check Supabase OTP is enabled:**
   - Dashboard → Authentication → Providers → Email
   - "Enable Email OTP" must be checked ✅

4. **Try resending:**
   - Click "Resend Code" button
   - Check your spam folder
   - Wait a few seconds for email to arrive

### Email Not Received:

**Problem:** No email with OTP code

**Solutions:**
1. **Check spam folder**
2. **Verify email provider allows Supabase emails:**
   - Some providers block automated emails
   - Try a different email (Gmail usually works)
3. **Check Supabase email quota:**
   - Free tier has limited emails per hour
   - Check Dashboard → Settings → Usage
4. **Resend the code:**
   - Click "Resend Code" button on the screen

### Wrong Email Entered:

**Problem:** User entered wrong email during signup

**Solutions:**
1. Click "Back to Login" button
2. Start signup flow again with correct email
3. Or: Add email change functionality (future enhancement)

---

## Security Considerations

✅ **Time-limited codes** - OTP codes expire after 1 hour
✅ **One-time use** - Each code can only be used once
✅ **Server-side validation** - Supabase validates codes on their servers
✅ **Rate limiting** - Supabase limits resend attempts to prevent abuse
✅ **Email verification required** - Users must have access to their email inbox

---

## Future Enhancements (Optional)

1. **Rate limiting on resend:**
   - Add countdown timer (e.g., "Resend code in 30s")
   - Prevent spam clicking "Resend Code"

2. **Auto-fill from clipboard:**
   - Detect when user copies code
   - Auto-fill the input field

3. **Better error messages:**
   - Distinguish between "invalid code" and "expired code"
   - Show remaining time before code expires

4. **SMS verification as alternative:**
   - Allow phone number verification
   - Send OTP via SMS using Twilio

5. **Biometric verification:**
   - Store verified state securely
   - Use Face ID/Touch ID for future logins

---

## Comparison: OTP vs Deep Links

| Feature | OTP Codes | Deep Links |
|---------|-----------|------------|
| Works in Expo Go | ✅ Yes | ❌ No |
| Works in Gmail | ✅ Yes | ❌ No |
| Requires rebuild | ❌ No | ✅ Yes |
| Requires web server | ❌ No | ✅ Yes (Universal Links) |
| Requires Apple Dev account | ❌ No | ✅ Yes (Universal Links) |
| User experience | Good (copy-paste) | Better (one-click) |
| Implementation time | Fast (1 hour) | Slow (1-2 days) |
| Security | ✅ Time-limited | ✅ Secure |

**Recommendation:** Use OTP for MVP and early testing. Switch to Universal Links for production when you have Apple Developer account and web server set up.

---

## Production Checklist

Before launching:

- [x] OTP enabled in Supabase
- [x] Email template updated with OTP display
- [x] EmailConfirmationScreen updated with OTP input
- [ ] Test with real email addresses (not disposable)
- [ ] Test OTP expiry (wait 1 hour and try code)
- [ ] Test resend functionality
- [ ] Test error handling (wrong code)
- [ ] Test complete flow: signup → OTP → payment → app access
- [ ] Set up email monitoring (track delivery rates)
- [ ] Consider adding SMS verification as backup

---

*Last Updated: 2025-01-24*
