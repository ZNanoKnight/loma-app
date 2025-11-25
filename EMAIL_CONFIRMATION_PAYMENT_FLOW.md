# Complete Email Confirmation + Payment Flow Implementation

**Date:** 2025-01-24
**Purpose:** Implement complete user flow: Email confirmation → Payment collection → App access

---

## Overview

This implementation adds a complete signup flow where users:
1. Complete onboarding and create account
2. Verify their email address via deep link
3. Complete payment subscription
4. Gain access to the app

This ensures email verification is required AND payment is collected before users can access the app.

---

## Flow Diagram

```
User completes onboarding
  ↓
Clicks "Start Free Trial" on PaymentScreen
  ↓
Account created in Supabase (unverified)
  ↓
Selected plan saved to UserContext
  ↓
Navigate to EmailConfirmationScreen
  ↓
User checks email and clicks confirmation link
  ↓
Deep link opens app (lomaapp://auth/confirm?token=...)
  ↓
RootNavigator verifies email with Supabase
  ↓
Email verified! ✅
  ↓
Check: Has user completed payment?
  ├─ No  → Navigate to PaymentCollectionScreen
  └─ Yes → Show welcome message
  ↓
User selects plan on PaymentCollectionScreen
  ↓
Clicks "Complete Payment & Start Free Trial"
  ↓
Stripe Payment Sheet appears
  ↓
User enters payment details
  ↓
Payment processes successfully
  ↓
hasCompletedOnboarding set to true
  ↓
User automatically navigates to HomeScreen (MainTab)
```

---

## Key Implementation Details

### 1. PaymentScreen Changes
**File:** `src/screens/onboarding/PaymentScreen.tsx`

**Changes:**
- Save `selectedPlan` to UserContext BEFORE email confirmation
- This ensures we remember the user's plan choice when they return after email verification

```typescript
// Save selected plan to UserContext BEFORE email confirmation
updateUserData({
  selectedPlan,
  email: email.trim().toLowerCase(),
});
```

### 2. PaymentCollectionScreen (New)
**File:** `src/screens/onboarding/PaymentCollectionScreen.tsx`

**Purpose:**
- Shown after email verification to collect payment
- Displays plan selection (pre-selected from UserContext)
- Handles Stripe payment sheet
- Updates `hasCompletedOnboarding` after successful payment

**Key Features:**
- Pre-selects the plan user chose during onboarding
- Shows success message with cookie emoji explaining Munchies
- Full Stripe integration with payment sheet
- Error handling and retry logic

### 3. RootNavigator Changes
**File:** `src/navigation/RootNavigator.tsx`

**Changes:**
1. Added `pendingPaymentNavigation` state flag
2. Deep link handler now:
   - Verifies email with Supabase
   - Loads user profile
   - Checks `has_completed_onboarding` flag
   - If false: Sets `pendingPaymentNavigation` flag and shows alert
   - If true: Shows welcome back message
3. Updated render logic:
   - If `isAuthenticated && hasCompletedOnboarding`: Show MainTab
   - If `isAuthenticated && !hasCompletedOnboarding && pendingPaymentNavigation`: Show PaymentCollectionScreen
   - Otherwise: Show regular onboarding

```typescript
const shouldShowPaymentCollection =
  userData.isAuthenticated &&
  !userData.hasCompletedOnboarding &&
  pendingPaymentNavigation;

const shouldShowMainApp =
  userData.isAuthenticated &&
  userData.hasCompletedOnboarding;
```

### 4. OnboardingNavigator Changes
**File:** `src/navigation/OnboardingNavigator.tsx`

**Changes:**
1. Added `PaymentCollectionScreen` import and route
2. Made navigator accept `route` prop
3. Dynamic `initialRouteName` based on route params:
   - If `route.params.screen === 'PaymentCollection'`: Start at PaymentCollection
   - Otherwise: Start at Welcome

```typescript
export default function OnboardingNavigator({ route }: any) {
  const initialRoute = route?.params?.screen || 'Welcome';

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      {/* ... screens */}
      <Stack.Screen name="PaymentCollection" component={PaymentCollectionScreen} />
    </Stack.Navigator>
  );
}
```

---

## Testing the Complete Flow

### Prerequisites:
1. Supabase email confirmation ENABLED (Authentication → Providers → Email → "Confirm email" checked)
2. Supabase email template updated with deep link: `lomaapp://auth/confirm?token={{ .TokenHash }}&type=signup`
3. Redirect URLs configured in Supabase
4. SQL migration applied (`20250124_fix_rls_profile_creation.sql`)
5. App rebuilt with updated code

### Test Steps:

1. **Delete existing test account** (if any):
   - Supabase Dashboard → Authentication → Users → Delete user
   - Database → user_profiles → Delete profile row

2. **Start fresh signup**:
   ```bash
   npx expo start --clear --tunnel
   ```

3. **Complete onboarding**:
   - Enter name, stats, goals, dietary preferences, etc.
   - On PaymentScreen: Select plan, enter password, agree to terms
   - Click "Start Free Trial"

4. **Email confirmation**:
   - Verify EmailConfirmationScreen appears
   - Check email inbox
   - Click confirmation link in email

5. **Deep link opens app**:
   - App opens automatically
   - Alert shows: "Email Verified! 🎉"
   - Click "Continue"

6. **Payment collection**:
   - PaymentCollectionScreen appears
   - Plan is pre-selected (the one chosen during onboarding)
   - Select desired plan (can change)
   - Click "Complete Payment & Start Free Trial"

7. **Stripe payment**:
   - Stripe payment sheet appears
   - Enter test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Submit payment

8. **Success**:
   - Alert shows: "Welcome to LOMA! 🎉"
   - Click "Get Started"
   - HomeScreen appears
   - User is logged in
   - Token balance should show (after webhook processes)

---

## Files Changed Summary

### New Files:
1. **src/screens/onboarding/PaymentCollectionScreen.tsx** - Post-verification payment screen

### Modified Files:
1. **src/screens/onboarding/PaymentScreen.tsx**
   - Added `updateUserData({ selectedPlan, email })` before email confirmation

2. **src/navigation/RootNavigator.tsx**
   - Added `pendingPaymentNavigation` state
   - Updated deep link handler to check `has_completed_onboarding`
   - Updated render logic to show PaymentCollectionScreen when needed

3. **src/navigation/OnboardingNavigator.tsx**
   - Added `PaymentCollectionScreen` import and route
   - Added `route` prop to accept initial screen parameter
   - Dynamic `initialRouteName` based on params

4. **SUPABASE_CONFIGURATION_STEPS.md**
   - Updated test flow to include PaymentCollectionScreen
   - Updated verification checklist

---

## Database Schema Notes

The `user_profiles` table already has a `has_completed_onboarding` field that tracks whether the user has completed the full signup process including payment.

**Flow:**
- After email confirmation: `has_completed_onboarding = false`
- After payment success: `has_completed_onboarding = true`

This field is set in:
- PaymentScreen.tsx (initial creation): `has_completed_onboarding: false`
- PaymentCollectionScreen.tsx (after payment): Updates UserContext with `hasCompletedOnboarding: true`
- The UserContext then syncs to Supabase via `UserService.updateUserProfile()`

---

## Error Handling

### Scenario 1: User clicks email link but payment fails
- User is on PaymentCollectionScreen
- Can retry payment multiple times
- Email is already verified, no need to reverify

### Scenario 2: User closes app after email verification
- On next app open, RootNavigator checks session
- Finds `isAuthenticated: true` but `has_completed_onboarding: false`
- Shows PaymentCollectionScreen automatically

### Scenario 3: User changes their mind about plan
- Can select different plan on PaymentCollectionScreen
- Original plan stored in UserContext is just a default
- New selection is saved when payment completes

### Scenario 4: Email verification link expires
- User can resend email from EmailConfirmationScreen
- New confirmation email sent with fresh token

---

## Security Considerations

✅ **Email verification required** - Users cannot access app without verifying email
✅ **Payment required** - Users cannot access app without completing payment
✅ **RLS policies intact** - Secure Postgres function bypasses RLS safely
✅ **Deep link validation** - Token verified server-side by Supabase
✅ **Payment processing secure** - Handled by Stripe, no card data stored

---

## Future Enhancements (Optional)

1. **Payment reminder emails** - Send automated reminder if user verified email but didn't complete payment
2. **Payment timeout** - Expire pending accounts after X days without payment
3. **Plan change flow** - Allow users to change plan before payment (already supported)
4. **Save payment method** - Store payment method in Stripe for future charges
5. **Trial extension** - Offer extended trial if payment fails initially

---

*Last Updated: 2025-01-24*
