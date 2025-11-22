# Sentry Integration Guide

## ✅ Fully Integrated!

Sentry is now fully integrated into your Loma App for automatic error tracking and monitoring.

---

## 🎯 What's Automated

### Automatic Error Capture

Sentry now **automatically** captures:

1. **Unhandled JavaScript Exceptions**
   ```javascript
   // This will be sent to Sentry automatically
   throw new Error('Something broke!');
   ```

2. **Unhandled Promise Rejections**
   ```javascript
   // This will be sent to Sentry automatically
   async function fetchData() {
     throw new Error('API failed');
   }
   fetchData(); // Unhandled rejection
   ```

3. **React Component Errors**
   ```javascript
   // Caught by ErrorBoundary and sent to Sentry
   function BrokenComponent() {
     const obj = null;
     return <div>{obj.property}</div>; // TypeError!
   }
   ```

4. **Navigation Errors** (if they occur in React components)

5. **All LomaError instances** from your services

---

## 📊 How It Works

### 1. App Initialization (App.tsx)

Sentry is initialized before your app starts:

```typescript
Sentry.init({
  dsn: ENV.SENTRY_DSN,
  environment: ENV.NODE_ENV,
  debug: ENV.IS_DEV,

  // Performance monitoring
  tracesSampleRate: ENV.IS_DEV ? 1.0 : 0.2,

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Privacy filters
  beforeSend(event, hint) {
    // Filters out passwords and sensitive data
  },
});
```

### 2. Error Boundary (ErrorBoundary.tsx)

Catches all React component errors:

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  logErrorToMonitoring(error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  });
}
```

### 3. Error Handler (errorHandler.ts)

All errors throughout the app flow through `logErrorToMonitoring()`:

```typescript
export const logErrorToMonitoring = (error: unknown, context?: Record<string, any>) => {
  // Sends to Sentry with proper categorization
  Sentry.captureException(error, {
    level: isNetworkError(error) ? 'warning' : 'error',
    extra: context,
    tags: {
      errorType: error instanceof LomaError ? error.code : 'unknown',
    },
  });
};
```

---

## 🔧 Manual Error Reporting

### When to Use Manual Reporting

Use manual reporting for:
- Expected errors you want to track
- Business logic errors
- Validation failures
- Custom events

### How to Report Errors Manually

```typescript
import { logErrorToMonitoring, addBreadcrumb } from '../utils/errorHandler';

// Report an error
try {
  await riskyOperation();
} catch (error) {
  logErrorToMonitoring(error, {
    context: 'Recipe Generation',
    userId: user.id,
    attemptNumber: 3,
  });
}

// Add breadcrumb for debugging
addBreadcrumb(
  'User clicked generate recipe',
  'user-action',
  'info',
  { mealType: 'breakfast', hasPreferences: true }
);
```

---

## 👤 User Context Tracking

### Set User Context (After Login)

Call this after a user successfully logs in to associate errors with specific users:

```typescript
import { setUserContext } from '../utils/errorHandler';

// After successful login
const user = await AuthService.signIn({ email, password });
setUserContext(user.user.id, user.user.email, `${firstName} ${lastName}`);
```

### Clear User Context (On Logout)

Call this when user logs out:

```typescript
import { clearUserContext } from '../utils/errorHandler';

// On logout
await AuthService.signOut();
clearUserContext();
```

---

## 📍 Breadcrumbs for Debugging

Breadcrumbs help trace the sequence of events leading to an error.

### Automatic Breadcrumbs

Sentry automatically creates breadcrumbs for:
- ✅ Console logs
- ✅ Network requests (fetch/axios)
- ✅ User interactions (touches, clicks)
- ✅ Navigation events

### Manual Breadcrumbs

Add custom breadcrumbs for important user actions:

```typescript
import { addBreadcrumb } from '../utils/errorHandler';

// When user generates a recipe
addBreadcrumb(
  'Recipe generation started',
  'recipe',
  'info',
  { mealType: 'dinner', tokenBalance: 5 }
);

// When user saves a recipe
addBreadcrumb(
  'Recipe saved',
  'recipe',
  'info',
  { recipeId: '123', isFavorite: true }
);

// When user makes a payment
addBreadcrumb(
  'Payment initiated',
  'payment',
  'info',
  { plan: 'monthly', amount: 7.99 }
);
```

---

## 🔍 What You'll See in Sentry Dashboard

When an error occurs, Sentry shows:

### Error Details
- **Stack trace** - Exact line where error occurred
- **Error message** - What went wrong
- **Error type** - LomaError code or exception type

### Context
- **User info** - User ID, email, name (if set)
- **Device info** - OS, device model, app version
- **Environment** - development, staging, production
- **Tags** - errorType, context, etc.

### Timeline
- **Breadcrumbs** - Sequence of events leading to error
- **Timestamp** - When error occurred
- **Frequency** - How many times this error happened

### Additional Data
- **Custom context** - Any extra data you passed
- **Session replay** - Video of what user did (if error occurred)
- **Component stack** - React component tree

---

## 🎨 Example Integration Points

### Example 1: Authentication Service

```typescript
// src/services/auth/authService.ts
import { logErrorToMonitoring, setUserContext } from '../../utils/errorHandler';

async signIn(request: SignInRequest): Promise<AuthSession> {
  try {
    const session = await supabase.auth.signInWithPassword({ ... });

    // Set user context for future errors
    setUserContext(
      session.user.id,
      session.user.email,
      `${profileData.firstName} ${profileData.lastName}`
    );

    return session;
  } catch (error) {
    logErrorToMonitoring(error, {
      context: 'SignIn',
      email: request.email,
    });
    throw error;
  }
}
```

### Example 2: Recipe Generation

```typescript
// src/services/recipes/recipeService.ts
import { addBreadcrumb, logErrorToMonitoring } from '../../utils/errorHandler';

async generateRecipe(preferences: any): Promise<Recipe> {
  addBreadcrumb(
    'Recipe generation started',
    'recipe',
    'info',
    { mealType: preferences.mealType }
  );

  try {
    const recipe = await openAI.generate(preferences);

    addBreadcrumb(
      'Recipe generated successfully',
      'recipe',
      'info',
      { recipeId: recipe.id }
    );

    return recipe;
  } catch (error) {
    logErrorToMonitoring(error, {
      context: 'RecipeGeneration',
      preferences,
      tokenBalance: user.tokens,
    });
    throw error;
  }
}
```

### Example 3: Payment Processing

```typescript
// src/services/subscription/subscriptionService.ts
import { addBreadcrumb, logErrorToMonitoring } from '../../utils/errorHandler';

async purchaseSubscription(plan: string): Promise<void> {
  addBreadcrumb(
    'Purchase initiated',
    'payment',
    'info',
    { plan, userId: user.id }
  );

  try {
    await stripe.createSubscription({ ... });

    addBreadcrumb(
      'Purchase successful',
      'payment',
      'info',
      { plan }
    );
  } catch (error) {
    logErrorToMonitoring(error, {
      context: 'PurchaseSubscription',
      plan,
      userId: user.id,
    });
    throw error;
  }
}
```

---

## ⚙️ Configuration

### Environment-Based Configuration

```typescript
// Development: Capture all errors, enable debug
tracesSampleRate: ENV.IS_DEV ? 1.0 : 0.2

// Production: Sample 20% of transactions
tracesSampleRate: 0.2
```

### Privacy & Security

**Automatic Filtering:**
- ❌ Passwords are filtered from error messages
- ❌ Console logs containing "password" are excluded from breadcrumbs
- ✅ Only necessary user data is sent (id, email)

**Before Send Hook:**
```typescript
beforeSend(event, hint) {
  if (event.message?.includes('password')) {
    event.message = event.message.replace(/password=\S+/gi, 'password=[FILTERED]');
  }
  return event;
}
```

---

## 📈 Performance Monitoring

Sentry also tracks performance:
- **Transaction tracing** - How long operations take
- **Network monitoring** - API call performance
- **Screen load times** - How fast screens render

---

## 🚨 Alerts & Notifications

In your Sentry dashboard, you can configure:
- **Email alerts** when errors occur
- **Slack notifications** for critical errors
- **Issue assignment** to team members
- **Release tracking** to see which version has errors

---

## 🧪 Testing Sentry

### Test Error Reporting

```typescript
import * as Sentry from '@sentry/react-native';

// Test button
<Button
  title="Test Error"
  onPress={() => {
    Sentry.captureException(new Error('Test error from Loma App'));
  }}
/>

// Or throw an error
<Button
  title="Crash App"
  onPress={() => {
    throw new Error('Intentional crash for testing');
  }}
/>
```

### Check Sentry Dashboard

1. Go to: https://sentry.io
2. Select your project
3. Click **Issues**
4. You should see your test error

---

## ✅ Best Practices

### DO:
✅ Set user context after login
✅ Clear user context on logout
✅ Add breadcrumbs for important user actions
✅ Include relevant context with errors
✅ Use specific error codes (LomaError)
✅ Filter sensitive data before sending

### DON'T:
❌ Send passwords or tokens to Sentry
❌ Report expected errors as exceptions
❌ Over-use manual error reporting
❌ Send personally identifiable information (PII) without permission
❌ Leave debug mode enabled in production

---

## 📚 Additional Resources

- **Sentry Docs:** https://docs.sentry.io/platforms/react-native/
- **React Native Guide:** https://docs.sentry.io/platforms/react-native/
- **Performance Monitoring:** https://docs.sentry.io/platforms/react-native/performance/
- **Session Replay:** https://docs.sentry.io/platforms/react-native/session-replay/

---

## 🎉 You're All Set!

Sentry is now fully integrated and will automatically track all errors in your app. Errors will appear in your Sentry dashboard at:

**https://sentry.io/organizations/[your-org]/issues/**

Happy monitoring! 🚀
