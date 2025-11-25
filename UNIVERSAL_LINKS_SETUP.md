# Universal Links Setup Guide

**Date:** 2025-01-24
**Purpose:** Replace custom URL schemes with Universal Links for better email compatibility

---

## What are Universal Links?

Universal Links (iOS) and App Links (Android) allow you to use regular `https://` URLs that:
- Open your app when installed
- Fall back to your website when app isn't installed
- Work in **all email clients** (including Gmail)
- Are more secure and professional

---

## Prerequisites

- Your website domain (e.g., `yourdomain.com`)
- Access to your website's root directory
- Apple Developer Team ID (for iOS)
- Android keystore SHA256 fingerprint

---

## Step 1: Host Required Files on Your Website

### A. Create `.well-known` Directory

On your web server, create a directory: `.well-known` at the root:
```
https://yourdomain.com/.well-known/
```

### B. Apple App Site Association (iOS)

Create file: `.well-known/apple-app-site-association` (NO file extension!)

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "YOUR_TEAM_ID.com.znanoknight.lomaapp",
        "paths": [
          "/auth/confirm",
          "/auth/*",
          "/payment-complete",
          "/reset-password"
        ]
      }
    ]
  }
}
```

**Replace `YOUR_TEAM_ID` with:**
- Go to https://developer.apple.com/account
- Click on "Membership" in sidebar
- Copy your Team ID (looks like: `A1B2C3D4E5`)

**Important:**
- Must be served with `Content-Type: application/json`
- Must be accessible at: `https://yourdomain.com/.well-known/apple-app-site-association`
- No file extension!

### C. Asset Links (Android)

Create file: `.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.znanoknight.lomaapp",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT_HERE"
      ]
    }
  }
]
```

**To get SHA256 fingerprint:**

For development (debug build):
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256
```

For production (release build):
```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your-alias | grep SHA256
```

Copy the SHA256 value (looks like: `14:6D:E9:83...`)

**Important:**
- Must be served with `Content-Type: application/json`
- Must be accessible at: `https://yourdomain.com/.well-known/assetlinks.json`

---

## Step 2: Update app.config.js

**Already done!** The app.config.js has been updated with:
- iOS `associatedDomains`
- Android `intentFilters` for https scheme

**Important:** Replace `yourdomain.com` with your actual domain in app.config.js (lines 22, 49, 54).

---

## Step 3: Create Redirect Page on Your Website

Upload the `website-redirect-example.html` file to your website at:
```
https://yourdomain.com/auth/confirm
```

This page will:
1. Extract the token from the URL
2. Attempt to open your app via deep link
3. Show a fallback button if the app doesn't open

**Customize the HTML:**
- Replace `yourdomain.com` with your actual domain
- Update download link to point to App Store/Play Store (when available)

---

## Step 4: Update Supabase Email Template

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Select **"Confirm signup"** template
3. Replace with:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>

<p><a href="https://yourdomain.com/auth/confirm?token={{ .TokenHash }}&type=signup" style="display: inline-block; background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Confirm your email</a></p>

<p style="margin-top: 20px; color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>

<p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all;">
https://yourdomain.com/auth/confirm?token={{ .TokenHash }}&type=signup
</p>

<p style="color: #999; font-size: 12px; margin-top: 20px;">You're receiving this email because you signed up for LOMA. If you didn't request this, you can safely ignore this email.</p>
```

4. **Replace `yourdomain.com`** with your actual domain
5. Click **Save**

---

## Step 5: Update Supabase Redirect URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   ```
   https://yourdomain.com/auth/confirm
   https://www.yourdomain.com/auth/confirm
   lomaapp://auth/confirm
   ```

---

## Step 6: Rebuild Your App

Universal Links require a **production build** (not Expo Go):

### For iOS:
```bash
eas build --platform ios --profile production
```

Then install via TestFlight or direct install.

### For Android:
```bash
eas build --platform android --profile production
```

Then install the APK.

**Note:** Universal Links don't work in Expo Go. You must build a standalone app.

---

## Step 7: Test Universal Links

### Test iOS Universal Links:

1. **Verify AASA file is accessible:**
   ```
   https://yourdomain.com/.well-known/apple-app-site-association
   ```
   Should return JSON (no error).

2. **Use Apple's validator:**
   Go to: https://search.developer.apple.com/appsearch-validation-tool/
   Enter: `https://yourdomain.com`
   Verify your app is listed

3. **Test the link:**
   - Send yourself an email with: `https://yourdomain.com/auth/confirm?token=test&type=signup`
   - Click the link in Apple Mail (Safari)
   - Should prompt "Open in LOMA?" → Click Open

### Test Android App Links:

1. **Verify assetlinks.json is accessible:**
   ```
   https://yourdomain.com/.well-known/assetlinks.json
   ```
   Should return JSON.

2. **Test with adb:**
   ```bash
   adb shell am start -a android.intent.action.VIEW -d "https://yourdomain.com/auth/confirm?token=test&type=signup"
   ```
   Should open your app.

3. **Test the link:**
   - Send yourself an email with the link
   - Click in Gmail app
   - Should prompt to open in LOMA

---

## Troubleshooting

### iOS Universal Links Not Working:

1. **Check AASA file accessibility:**
   - Visit: `https://yourdomain.com/.well-known/apple-app-site-association`
   - Must return 200 status code
   - Must have `Content-Type: application/json`
   - No redirects allowed

2. **Verify Team ID is correct:**
   - Check your Apple Developer account
   - Team ID format: `A1B2C3D4E5` (10 characters)

3. **Verify bundle identifier matches:**
   - Must be exactly: `com.znanoknight.lomaapp`
   - Check in app.config.js and Apple Developer portal

4. **Clear device cache:**
   - Delete app
   - Restart device
   - Reinstall app

### Android App Links Not Working:

1. **Check assetlinks.json accessibility:**
   - Visit: `https://yourdomain.com/.well-known/assetlinks.json`
   - Must return 200 status code
   - Must have `Content-Type: application/json`

2. **Verify SHA256 fingerprint:**
   - Run the keytool command again
   - Ensure you're using the correct keystore (debug vs release)
   - Fingerprint must match exactly

3. **Verify package name:**
   - Must be: `com.znanoknight.lomaapp`

4. **Reset app link preferences:**
   ```bash
   adb shell pm set-app-links --package com.znanoknight.lomaapp 0 all
   adb shell pm set-app-links --package com.znanoknight.lomaapp 2 yourdomain.com
   ```

### Link Opens Browser Instead of App:

- **iOS:** Long-press the link and select "Open in LOMA" (first time only)
- **Android:** Go to Settings → Apps → LOMA → Open by default → Add links

---

## Production Checklist

Before launch:

- [ ] AASA file hosted and accessible
- [ ] assetlinks.json hosted and accessible
- [ ] Team ID correct in AASA file
- [ ] SHA256 fingerprints added (both debug and release)
- [ ] Domain updated in app.config.js
- [ ] Supabase email template updated with https:// URLs
- [ ] Redirect URLs added in Supabase
- [ ] Production builds tested on real devices
- [ ] Universal Links tested in Apple Mail (iOS)
- [ ] App Links tested in Gmail (Android)

---

## Fallback Strategy

If Universal Links fail, the redirect page will:
1. Attempt to open via custom URL scheme (`lomaapp://`)
2. Show manual "Open App" button
3. Provide link to download app if not installed

This ensures users can always complete email verification!

---

*Last Updated: 2025-01-24*
