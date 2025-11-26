# LOMA App Study Guide

**A Complete Guide to Understanding How a Modern Mobile App Works**

*Written for non-engineers who want to understand the full picture*

---

## Table of Contents

1. [What is LOMA?](#1-what-is-loma)
2. [The Big Picture: How Apps Work](#2-the-big-picture-how-apps-work)
3. [Key Terms Glossary](#3-key-terms-glossary)
4. [The Technology Stack](#4-the-technology-stack)
5. [User Journey: From Download to Cooking](#5-user-journey-from-download-to-cooking)
6. [Authentication: How Users Sign Up and Log In](#6-authentication-how-users-sign-up-and-log-in)
7. [The Database: Where All Data Lives](#7-the-database-where-all-data-lives)
8. [Payments: How Money Flows](#8-payments-how-money-flows)
9. [Webhooks: How Services Talk to Each Other](#9-webhooks-how-services-talk-to-each-other)
10. [AI Recipe Generation: The Magic Behind the Scenes](#10-ai-recipe-generation-the-magic-behind-the-scenes)
11. [Edge Functions: Your Backend Without Servers](#11-edge-functions-your-backend-without-servers)
12. [Security: Keeping Users Safe](#12-security-keeping-users-safe)
13. [Error Tracking: Knowing When Things Break](#13-error-tracking-knowing-when-things-break)
14. [The Munchies Token System](#14-the-munchies-token-system)
15. [File Structure: How the Code is Organized](#15-file-structure-how-the-code-is-organized)
16. [Common Bugs and How We Fixed Them](#16-common-bugs-and-how-we-fixed-them)
17. [Cost Breakdown: What It Takes to Run an App](#17-cost-breakdown-what-it-takes-to-run-an-app)
18. [If I Was to Do It Again](#18-if-i-was-to-do-it-again)

---

## 1. What is LOMA?

LOMA is an AI-powered recipe generation mobile app. Users tell the app about their dietary preferences, allergies, cooking skill level, and available equipment. Then, when they want a meal, the app uses artificial intelligence to create 4 personalized recipe options tailored specifically to them.

**The Core Value Proposition:**
- Personalized recipes (not generic ones from a cookbook)
- Considers allergies and dietary restrictions
- Matches your cooking skill level
- Uses only equipment you actually have
- Step-by-step cooking instructions

**The Business Model:**
- Subscription-based (Weekly: $3.99, Monthly: $7.99, Yearly: $48.99)
- Token system called "Munchies" - each recipe generation costs 1 Munchie
- 7-day free trial with 2 Munchies to try it out

---

## 2. The Big Picture: How Apps Work

Before diving into LOMA specifically, let's understand how modern apps work in general.

### The Three Main Parts

**1. The Frontend (What Users See)**
- This is the app on your phone
- Built with React Native (one codebase works on both iPhone and Android)
- Handles all the buttons, screens, animations, and user interactions
- Stores some data locally on the device

**2. The Backend (The Brain)**
- Lives on servers in the cloud (we use Supabase)
- Stores all the important data (user profiles, recipes, subscriptions)
- Handles sensitive operations (payments, AI calls)
- Users never see this directly

**3. Third-Party Services (Specialized Tools)**
- Stripe: Handles all payment processing
- OpenAI: Generates recipes using AI
- Sentry: Tracks errors and crashes
- Each does one thing really well

### How They Communicate

```
User taps "Generate Recipe"
         |
         v
    [LOMA App]
         |
         | (sends request over internet)
         v
    [Supabase Backend]
         |
         | (calls OpenAI)
         v
    [OpenAI API]
         |
         | (returns recipe data)
         v
    [Supabase Backend]
         |
         | (sends back to app)
         v
    [LOMA App shows recipes]
```

---

## 3. Key Terms Glossary

Understanding these terms will make everything else clearer.

### API (Application Programming Interface)
Think of an API as a waiter at a restaurant. You (the app) tell the waiter what you want, the waiter goes to the kitchen (the server), and brings back what you ordered. The waiter is the API - the middleman that takes requests and returns responses.

**Example:** When LOMA asks OpenAI for recipes, it uses OpenAI's API. LOMA sends a request ("I need 4 breakfast recipes for a vegetarian"), and OpenAI's API returns the recipes.

### Database
A organized collection of data stored on a computer. Think of it like a giant Excel spreadsheet with different tabs (tables) for different types of information - one for users, one for recipes, one for subscriptions, etc.

### JWT (JSON Web Token)
A secure "ID card" that proves who you are. When you log in, the server gives you a JWT. Every time you make a request, you show this JWT to prove it's really you. It expires after a while for security.

### Edge Function
A small piece of code that runs on a server, but only when needed. Instead of having a server running 24/7, Edge Functions "wake up" when called, do their job, and go back to sleep. This saves money and scales automatically.

**Example:** The `generate-recipe` Edge Function only runs when someone actually wants to generate a recipe.

### Webhook
A way for one service to notify another when something happens. Instead of constantly asking "did anything change?", you tell the service "call me when something happens."

**Example:** When someone pays through Stripe, Stripe sends a webhook to our server saying "hey, this person just paid!" Our server then updates their subscription.

### SDK (Software Development Kit)
A toolbox of pre-built code that makes it easier to use a service. Instead of writing everything from scratch, you use the SDK.

**Example:** The Stripe SDK handles all the complicated payment form stuff - we just tell it "collect payment" and it does the rest.

### Environment Variables
Secret configuration values (like passwords and API keys) that are kept separate from the code. This way, you can share your code publicly without revealing sensitive information.

### RLS (Row-Level Security)
Database rules that ensure users can only see their own data. Even if someone hacks the app, they can't see other users' information because the database itself blocks unauthorized access.

### CORS (Cross-Origin Resource Sharing)
Security rules that control which websites/apps can talk to your server. Prevents random websites from accessing your data.

### Serverless
A way of running code without managing actual servers. You just write the code and a cloud provider (like Supabase) handles all the infrastructure.

---

## 4. The Technology Stack

Here's every technology LOMA uses and why:

### Frontend (The App)

| Technology | What It Does | Why We Chose It |
|------------|--------------|-----------------|
| **React Native** | Framework for building mobile apps | One codebase for iOS and Android |
| **Expo** | Tools that make React Native easier | Faster development, easier testing |
| **TypeScript** | Programming language (JavaScript with types) | Catches bugs before they happen |
| **React Navigation** | Handles moving between screens | Industry standard, works great |
| **AsyncStorage** | Stores data on the device | Persists user preferences offline |
| **SecureStorage** | Encrypted storage for sensitive data | Keeps JWT tokens safe |

### Backend (The Server)

| Technology | What It Does | Why We Chose It |
|------------|--------------|-----------------|
| **Supabase** | Backend-as-a-service | Free tier, real-time, PostgreSQL database |
| **PostgreSQL** | The actual database | Powerful, reliable, industry standard |
| **Edge Functions** | Serverless code execution | Only pay when code runs, scales automatically |
| **Deno** | Runtime for Edge Functions | Modern, secure, built for serverless |

### Third-Party Services

| Service | What It Does | Why We Chose It |
|---------|--------------|-----------------|
| **Stripe** | Payment processing | Industry leader, handles all compliance |
| **OpenAI** | AI recipe generation | Best-in-class language models |
| **Sentry** | Error tracking | Know when things break, detailed reports |

### Development Tools

| Tool | What It Does |
|------|--------------|
| **Git** | Version control (tracks all code changes) |
| **GitHub** | Hosts our code repository |
| **VS Code** | Code editor |
| **Claude Code** | AI assistant for coding |

---

## 5. User Journey: From Download to Cooking

Let's follow a user through the entire LOMA experience.

### Phase 1: Onboarding (First-Time Setup)

```
1. WELCOME SCREEN
   "Welcome to LOMA - Your AI Chef"
   [Get Started Button]
         |
         v
2. NAME & EMAIL
   User enters: First name, last name, email, password
   (Account not created yet - just collecting info)
         |
         v
3. PHYSICAL STATS
   Height, weight, age, gender
   (Used for nutritional calculations)
         |
         v
4. ACTIVITY LEVEL
   Sedentary / Lightly Active / Moderately Active / Very Active
   (Affects calorie recommendations)
         |
         v
5. HEALTH GOALS
   Weight Loss / Muscle Gain / Maintain Weight / General Health
         |
         v
6. DIETARY PREFERENCES
   Vegetarian / Vegan / Keto / Paleo / No Restrictions
         |
         v
7. ALLERGIES & RESTRICTIONS
   Nuts / Dairy / Gluten / Eggs / Soy / Shellfish / None
         |
         v
8. COOKING FREQUENCY
   Daily / Few times a week / Weekly / Occasionally
         |
         v
9. KITCHEN EQUIPMENT
   Oven / Stovetop / Microwave / Air Fryer / Blender / etc.
         |
         v
10. RECIPE PREVIEW
    Shows sample AI-generated recipes based on their preferences
    "This is what your personalized recipes will look like!"
         |
         v
11. SUBSCRIPTION SELECTION
    Choose: Weekly ($3.99) / Monthly ($7.99) / Yearly ($48.99)
    All include 7-day free trial
         |
         v
12. ACCOUNT CREATION & PAYMENT
    - Account created in Supabase
    - Email verification sent (6-digit code)
    - User enters code to verify
    - Payment collected via Stripe
    - Subscription activated
         |
         v
13. MAIN APP ACCESS
    User lands on HomeScreen with their Munchies balance
```

### Phase 2: Using the App

```
HOME SCREEN
├── Shows current Munchies balance (e.g., "20 Munchies")
├── Meal type selection: Breakfast / Lunch / Dinner / Snack
├── Optional: Custom request field ("Make it spicy!")
└── [Generate 4 Recipes] button
         |
         v
GENERATING... (5-10 seconds)
├── Loading animation with fun messages
├── AI is creating personalized recipes
├── Token deducted AFTER successful generation
         |
         v
RECIPE SELECTION SCREEN
├── 4 recipe cards in a 2x2 grid
├── Each shows: Title, emoji, calories, prep time
├── User taps to select one
└── [Select This Recipe] button
         |
         v
RECIPE DETAIL SCREEN
├── Full recipe information
├── Overview tab: Description, difficulty, time
├── Ingredients tab: Shopping list with quantities
├── Nutrition tab: Calories, protein, carbs, fats
├── [Start Cooking] button
└── Heart icon to save as favorite
         |
         v
EQUIPMENT CHECKLIST
├── Lists all required equipment
├── User checks off what they have
├── Suggests alternatives for missing items
└── [I'm Ready] button
         |
         v
COOKING INSTRUCTIONS
├── Step-by-step guidance
├── One step per screen
├── Timer for each step
├── Progress bar at top
├── [Next Step] / [Previous Step] buttons
└── [Recipe Complete!] on last step
         |
         v
COMPLETION SCREEN
├── Celebration animation
├── Rate this recipe (1-5 stars)
├── Add notes for next time
├── Achievement unlocked? (if applicable)
└── [Save to Recipe Book]
```

### Phase 3: Managing Account

```
SETTINGS TAB
├── Profile: Edit personal info, preferences
├── Subscription: View plan, Munchies balance
├── Manage Subscription: Opens Stripe Portal
└── Support: Help, feedback, about
```

---

## 6. Authentication: How Users Sign Up and Log In

Authentication is how the app knows who you are.

### The Sign-Up Process (Technical View)

```
User enters email + password
         |
         v
App calls AuthService.signUp()
         |
         v
Supabase Auth creates user account
├── Generates unique user ID (UUID)
├── Hashes password (never stored in plain text!)
├── Stores in auth.users table
└── Sends verification email
         |
         v
User receives email with 6-digit code
         |
         v
User enters code in app
         |
         v
App calls Supabase verifyOtp()
         |
         v
Supabase confirms code matches
├── Marks email as verified
├── Generates JWT tokens (access + refresh)
└── Returns tokens to app
         |
         v
App stores tokens in SecureStorage
         |
         v
User is now authenticated!
```

### JWT Tokens Explained

When you log in successfully, you get two tokens:

**Access Token** (Short-lived, ~1 hour)
- Used for every request to prove who you are
- Sent in the header of every API call
- If someone steals it, it expires quickly

**Refresh Token** (Long-lived, ~7 days)
- Used to get a new access token when the old one expires
- Stored securely on device
- If compromised, user must log in again

```
Every API request:
[App] ---> "Hey Supabase, give me my recipes"
           + "Here's my access token: eyJhbG..."
                    |
                    v
           [Supabase verifies token]
                    |
                    v
           "Token valid! Here are your recipes."
```

### Why This Matters

Without authentication:
- Anyone could access anyone's data
- No way to track who's who
- Couldn't have personalized features
- Payments wouldn't work

---

## 7. The Database: Where All Data Lives

LOMA uses PostgreSQL (via Supabase) to store all data.

### Database Tables

Think of each table like a spreadsheet tab:

#### `auth.users` (Built into Supabase)
```
| id (UUID)              | email              | encrypted_password | email_confirmed_at |
|------------------------|--------------------|--------------------|-------------------|
| a1b2c3d4-e5f6-...     | user@example.com   | $2a$10$...        | 2025-01-15 10:30  |
```
*Stores login credentials. Password is encrypted - even we can't read it.*

#### `user_profiles`
```
| user_id    | first_name | last_name | age | weight | dietary_preferences | allergens        |
|------------|------------|-----------|-----|--------|---------------------|------------------|
| a1b2c3d4.. | Sarah      | Johnson   | 28  | 140    | ["vegetarian"]      | ["nuts","dairy"] |
```
*Stores everything about the user that's NOT login-related.*

#### `subscriptions`
```
| user_id    | plan    | status  | tokens_balance | tokens_used | stripe_customer_id |
|------------|---------|---------|----------------|-------------|-------------------|
| a1b2c3d4.. | monthly | active  | 18             | 2           | cus_ABC123        |
```
*Tracks subscription status and Munchies balance.*

#### `recipes`
```
| id         | title              | calories | prep_time | ingredients (JSON)        |
|------------|--------------------| ---------|-----------|---------------------------|
| r1e2c3i4.. | Veggie Stir Fry   | 450      | 20        | [{item:"tofu", amount:...}] |
```
*Stores all AI-generated recipes.*

#### `user_recipes` (Junction Table)
```
| user_id    | recipe_id  | is_saved | is_favorite | rating | cooked_count |
|------------|------------|----------|-------------|--------|--------------|
| a1b2c3d4.. | r1e2c3i4.. | true     | true        | 5      | 3            |
```
*Links users to their saved recipes with their personal data (rating, notes, etc.)*

#### `generation_logs`
```
| user_id    | meal_type | success | estimated_cost | tokens_used | timestamp           |
|------------|-----------|---------|----------------|-------------|---------------------|
| a1b2c3d4.. | breakfast | true    | 0.0023         | 4600        | 2025-01-20 08:15:00 |
```
*Tracks every AI generation for cost monitoring.*

### Row-Level Security (RLS)

This is crucial for security. RLS rules ensure:

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

**What this means:** Even if a hacker manipulates the app to request someone else's data, the DATABASE ITSELF blocks the request. Security is enforced at the deepest level.

---

## 8. Payments: How Money Flows

LOMA uses Stripe for all payment processing. Here's the complete flow:

### Why Stripe?

- **PCI Compliance**: Credit card data is incredibly regulated. Stripe handles all compliance.
- **Never See Card Numbers**: Card details go directly to Stripe, never through our servers.
- **Global Support**: Works in 135+ countries with local payment methods.
- **Fraud Prevention**: Built-in AI to detect fraudulent transactions.

### The Payment Flow (Step by Step)

```
User selects "Monthly Plan - $7.99"
         |
         v
User enters email/password (account creation)
         |
         v
App calls create-payment-intent Edge Function
         |
         | What happens inside:
         | 1. Verify user is authenticated (JWT check)
         | 2. Create Stripe Customer (or find existing)
         | 3. Create Stripe Subscription with 7-day trial
         | 4. Save customer ID and subscription ID to database
         | 5. Return "client secret" to app
         |
         v
App receives client secret
         |
         v
App opens Stripe Payment Sheet (built-in UI)
         |
         | This is Stripe's secure form - we never see card details
         | User enters: Card number, expiry, CVC, ZIP
         |
         v
User taps "Subscribe"
         |
         v
Stripe processes payment
         |
         | - Validates card
         | - Checks for fraud
         | - Authorizes charge (won't actually charge until trial ends)
         |
         v
Stripe sends webhook to our server
         |
         | Event: "customer.subscription.created"
         | Contains: customer ID, subscription ID, plan details
         |
         v
stripe-webhook-handler Edge Function receives it
         |
         | 1. Verify webhook signature (is this really from Stripe?)
         | 2. Extract user ID from customer metadata
         | 3. Update subscriptions table:
         |    - status = 'trialing' (or 'active')
         |    - tokens_balance = 20 (for monthly)
         |    - stripe_customer_id = cus_XXX
         |    - stripe_subscription_id = sub_XXX
         |    - current_period_end = (date)
         |
         v
User now has 20 Munchies and can generate recipes!
```

### Subscription Lifecycle Events

Stripe sends different webhooks for different events:

| Event | When It Happens | What We Do |
|-------|-----------------|------------|
| `customer.subscription.created` | New subscription | Set initial tokens, status = 'trialing' |
| `customer.subscription.updated` | Plan change | Update plan type, adjust tokens |
| `invoice.payment_succeeded` | Successful charge | ADD tokens to balance (renewal) |
| `invoice.payment_failed` | Card declined | Set status = 'past_due', notify user |
| `customer.subscription.deleted` | Cancelled | Set status = 'cancelled', keep tokens until period end |

### The Stripe Customer Portal

Instead of building subscription management ourselves, we use Stripe's Customer Portal:

```
User taps "Manage Subscription"
         |
         v
App calls create-portal-session Edge Function
         |
         v
Edge Function creates Stripe Portal session
         |
         v
Returns URL: https://billing.stripe.com/session/XXX
         |
         v
App opens URL in browser
         |
         v
User can:
├── Update payment method
├── View billing history
├── Download invoices
├── Cancel subscription
└── Change plans
```

**Why this approach?** Building all this ourselves would take months. Stripe's portal is secure, compliant, and automatically updated.

---

## 9. Webhooks: How Services Talk to Each Other

This is one of the most important concepts to understand.

### The Problem Webhooks Solve

**Without webhooks (Polling):**
```
Every 10 seconds:
App: "Hey Stripe, did anything change?"
Stripe: "Nope"
App: "Hey Stripe, did anything change?"
Stripe: "Nope"
App: "Hey Stripe, did anything change?"
Stripe: "Nope"
App: "Hey Stripe, did anything change?"
Stripe: "Yes! A payment went through!"
```
*Wasteful - thousands of unnecessary requests*

**With webhooks (Push):**
```
App: "Stripe, call me at this URL when something happens"
Stripe: "Got it"

[Time passes - no communication]

[Payment goes through]

Stripe: "Hey App! A payment just succeeded. Here's all the details."
App: "Thanks! Updating the database now."
```
*Efficient - only communicates when needed*

### How Webhooks Work in LOMA

```
1. SETUP (One time)
   We tell Stripe: "Send events to https://our-supabase.co/functions/v1/stripe-webhook-handler"
   Stripe stores this URL

2. EVENT OCCURS
   User's card is charged successfully

3. STRIPE SENDS WEBHOOK
   POST https://our-supabase.co/functions/v1/stripe-webhook-handler
   Headers:
     Stripe-Signature: t=1234,v1=abc123...
   Body:
     {
       "type": "invoice.payment_succeeded",
       "data": {
         "object": {
           "customer": "cus_ABC123",
           "subscription": "sub_XYZ789",
           "amount_paid": 799
         }
       }
     }

4. OUR SERVER RECEIVES IT
   stripe-webhook-handler Edge Function wakes up

5. VERIFY SIGNATURE
   We check: Is this REALLY from Stripe or is someone faking it?
   Using our webhook secret, we verify the signature matches

6. PROCESS EVENT
   Look up user by customer ID
   Add tokens to their balance
   Update subscription status

7. RESPOND
   Return 200 OK to Stripe (so they know we got it)
```

### Why Signature Verification Matters

Anyone could send a fake webhook to our URL:
```
Evil Hacker: "Hey, I'm Stripe! User XYZ just paid for 1000 Munchies!"
```

But they don't know our webhook secret, so they can't create a valid signature:
```
Our Server: "Nice try. The signature doesn't match. Rejected."
```

---

## 10. AI Recipe Generation: The Magic Behind the Scenes

This is the core feature of LOMA.

### The Generation Flow

```
User selects "Lunch" and taps "Generate"
         |
         v
App calls generate-recipe Edge Function
         |
         | Sends:
         | - meal_type: "lunch"
         | - custom_request: "Make it spicy"
         | - user JWT token
         |
         v
Edge Function starts
         |
         v
1. AUTHENTICATE
   Verify JWT token is valid
   Extract user ID
         |
         v
2. FETCH USER PROFILE
   Get from database:
   - Dietary preferences: ["vegetarian"]
   - Allergens: ["nuts", "dairy"]
   - Equipment: ["oven", "stovetop", "blender"]
   - Skill level: "intermediate"
   - Goals: ["weight_loss"]
         |
         v
3. BUILD AI PROMPT

   System prompt:
   "You are a professional chef AI. Generate exactly 4 unique
   recipes based on the user's preferences. Return valid JSON..."

   User prompt:
   "Generate 4 lunch recipes for a user with these preferences:
   - Dietary: vegetarian
   - Allergies: nuts, dairy (CRITICAL - never include these)
   - Equipment: oven, stovetop, blender
   - Skill: intermediate
   - Goals: weight loss (aim for 400-500 calories)
   - Special request: Make it spicy

   Return 4 diverse options with full nutritional info..."
         |
         v
4. CALL OPENAI API
   Model: gpt-4o-mini (cheaper but still high quality)

   Request takes 5-10 seconds

   OpenAI returns ~3,500 tokens of JSON data
         |
         v
5. PARSE RESPONSE
   Validate JSON structure
   Ensure all required fields present
   Check that allergens are NOT in ingredients
         |
         v
6. SAVE TO DATABASE
   Insert 4 recipes into `recipes` table
   Link to user via `user_recipes` table
         |
         v
7. LOG GENERATION
   Record in `generation_logs`:
   - Success/failure
   - Token count: 4,600
   - Estimated cost: $0.0023
         |
         v
8. RETURN TO APP
   {
     "success": true,
     "recipes": [
       {
         "title": "Spicy Thai Basil Tofu",
         "emoji": "🌶️",
         "calories": 420,
         "prep_time": 15,
         "cook_time": 20,
         "ingredients": [...],
         "instructions": [...]
       },
       // ... 3 more recipes
     ]
   }
```

### Cost Analysis

We use GPT-4o-mini because it's 90% cheaper than GPT-4 Turbo while still producing high-quality recipes.

| Model | Input Cost | Output Cost | Per Recipe Generation |
|-------|------------|-------------|----------------------|
| GPT-4 Turbo | $10/1M tokens | $30/1M tokens | ~$0.02 |
| GPT-4o-mini | $0.15/1M tokens | $0.60/1M tokens | ~$0.002 |

**Monthly costs at scale:**
- 1,000 users × 10 generations each = 10,000 generations
- GPT-4o-mini: $20/month
- GPT-4 Turbo: $200/month

### Why Personalization Matters

A generic recipe app might return:
```
"Here are 4 lunch recipes: Chicken Caesar Salad, Beef Stir Fry,
Shrimp Tacos, Turkey Sandwich"
```

LOMA knows you're vegetarian with nut and dairy allergies, so it returns:
```
"Here are 4 lunch recipes personalized for you:
1. Spicy Thai Basil Tofu (no dairy, no nuts)
2. Mediterranean Quinoa Bowl (vegan, nut-free)
3. Black Bean Tacos (no cheese, coconut cream instead)
4. Lentil Curry (dairy-free, nut-free)"
```

---

## 11. Edge Functions: Your Backend Without Servers

Edge Functions are the "backend" of LOMA - code that runs on servers, not on the user's phone.

### Why Not Just Do Everything in the App?

Some things MUST happen on a server:
1. **Secrets**: API keys for Stripe/OpenAI can't be in the app (anyone could extract them)
2. **Security**: Token deduction must be verified server-side (users could hack the app)
3. **Webhooks**: Need a URL that's always available to receive events

### LOMA's Edge Functions

| Function | Purpose | When It's Called |
|----------|---------|------------------|
| `create-payment-intent` | Start a new subscription | User signs up |
| `stripe-webhook-handler` | Process Stripe events | Stripe sends webhooks |
| `generate-recipe` | Create AI recipes | User generates recipes |
| `deduct-token` | Remove Munchies from balance | After successful generation |
| `validate-token-usage` | Check if user can generate | Before generation |
| `create-portal-session` | Get Stripe portal URL | User manages subscription |

### Anatomy of an Edge Function

Here's what `deduct-token` looks like (simplified):

```javascript
// This runs on Supabase's servers, not on the phone

serve(async (request) => {
  // 1. Check authentication
  const authHeader = request.headers.get('Authorization');
  const token = authHeader.replace('Bearer ', '');
  const { user, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Get current balance
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tokens_balance')
    .eq('user_id', user.id)
    .single();

  // 3. Check if user has tokens
  if (subscription.tokens_balance < 1) {
    return new Response('Insufficient tokens', { status: 400 });
  }

  // 4. Deduct token (with optimistic locking)
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      tokens_balance: subscription.tokens_balance - 1,
      tokens_used: subscription.tokens_used + 1
    })
    .eq('user_id', user.id)
    .eq('tokens_balance', subscription.tokens_balance); // Only if balance hasn't changed!

  // 5. Return result
  return new Response(JSON.stringify({
    success: true,
    new_balance: subscription.tokens_balance - 1
  }));
});
```

### The "Serverless" Advantage

Traditional server:
- Runs 24/7 even when no one's using it
- You pay for the whole month
- You manage updates, security, scaling

Edge Functions:
- Only runs when called
- You pay per execution (first 2 million free!)
- Supabase handles everything else

---

## 12. Security: Keeping Users Safe

Security is built into every layer of LOMA.

### Layer 1: Authentication

```
[User] ---> [JWT Token] ---> [Supabase Auth]
               |
               v
        "Is this token valid?"
        "Yes, this is user a1b2c3d4"
```

Every request includes a JWT token. Without a valid token, the request is rejected.

### Layer 2: Row-Level Security (RLS)

Even if someone bypasses the app:
```
Hacker: "Give me user XYZ's recipes"
Database: "Your token says you're user ABC. Denied."
```

The database ITSELF enforces that users can only access their own data.

### Layer 3: Server-Side Validation

Critical operations happen on the server, not the app:

```
❌ WRONG (Client-side):
App: "User has 5 tokens. Subtracting 1. Now they have 4."
[Hacker modifies app to say they have 999 tokens]

✅ RIGHT (Server-side):
App: "Please deduct a token"
Server: "Let me check... User has 5 tokens. Subtracting 1. Now 4."
[Hacker can't modify what happens on our server]
```

### Layer 4: Webhook Signature Verification

```
Incoming webhook claims to be from Stripe
         |
         v
Extract signature from headers
         |
         v
Recalculate expected signature using our secret key
         |
         v
Do they match?
├── Yes: Process the webhook
└── No: Reject (it's fake!)
```

### Layer 5: Secrets Management

Sensitive values are NEVER in the code:

```
❌ WRONG:
const STRIPE_KEY = "sk_live_abc123..."  // Anyone can see this!

✅ RIGHT:
const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY')  // Stored in Supabase secrets
```

### Layer 6: Secure Token Storage

On the user's device:
```
Regular storage (AsyncStorage): User preferences, cached data
Encrypted storage (SecureStorage): JWT tokens
```

Even if someone gets access to the phone, encrypted storage requires device authentication.

---

## 13. Error Tracking: Knowing When Things Break

LOMA uses Sentry to track errors.

### Why Error Tracking Matters

Without it:
- Users experience crashes, you never know
- Bugs go unfixed for weeks
- No way to prioritize what to fix

With Sentry:
- Instant notification when something breaks
- Full stack trace (exactly where the error occurred)
- User context (what were they doing?)
- Frequency tracking (is this affecting 1 user or 1,000?)

### What Gets Tracked

```javascript
// In App.tsx
Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',

  // What environment is this?
  environment: 'production',  // or 'development'

  // Track performance too
  tracesSampleRate: 0.2,  // 20% of transactions

  // Session replays for debugging
  replaysOnErrorSampleRate: 1.0,  // 100% of errors get replays

  // User interaction tracking
  integrations: [
    Sentry.reactNativeTracingIntegration({
      enableUserInteractionTracing: true,  // Track button taps, etc.
      enableAppStartTracking: true,        // Track app launch time
    }),
  ],
});
```

### Privacy Considerations

We filter out sensitive data:
```javascript
beforeSend(event) {
  // Remove any passwords from error messages
  if (event.message?.includes('password')) {
    event.message = event.message.replace(/password=\S+/gi, 'password=[FILTERED]');
  }
  return event;
}
```

---

## 14. The Munchies Token System

"Munchies" are LOMA's internal currency for recipe generation.

### How It Works

```
User subscribes to Monthly plan
         |
         v
Stripe webhook fires: "subscription created"
         |
         v
Our server allocates 20 Munchies to their account
         |
         v
User generates recipes
         |
         v
1 Munchie deducted per generation (4 recipes)
         |
         v
When Munchies run out: "Upgrade your plan" prompt
         |
         v
Monthly renewal: +20 Munchies added to balance
```

### Token Allocation by Plan

| Plan | Price | Munchies | Cost per Recipe |
|------|-------|----------|-----------------|
| Weekly | $3.99/week | 5 | ~$0.80 |
| Monthly | $7.99/month | 20 | ~$0.40 |
| Yearly | $48.99/year | 240 | ~$0.20 |

### Why Tokens Instead of Unlimited?

1. **Cost Control**: AI generation costs money (~$0.002 per generation)
2. **Fair Usage**: Prevents abuse (someone generating 1000 recipes/day)
3. **Business Model**: Creates upgrade incentive

### Security: Server-Side Token Management

The most critical part: tokens are managed SERVER-SIDE.

```
❌ If managed client-side:
Hacker opens app code
Changes tokens_balance from 0 to 999
Generates unlimited recipes for free

✅ Managed server-side:
App: "I want to generate recipes"
Server: "Let me check your ACTUAL balance in the database..."
Server: "You have 0 tokens. Request denied."
Hacker can't change what's in our database
```

### Optimistic Locking (Preventing Race Conditions)

What if someone clicks "Generate" twice really fast?

```
Without protection:
Click 1: Check balance (5), deduct 1, new balance 4
Click 2: Check balance (5), deduct 1, new balance 4
Result: User generated twice but only lost 1 token!

With optimistic locking:
Click 1: Check balance (5), deduct 1 WHERE balance=5, success!
Click 2: Check balance (5), deduct 1 WHERE balance=5, FAILS (balance is now 4)
Result: Second request fails, must retry
```

The `WHERE balance=5` clause ensures the balance hasn't changed since we checked it.

---

## 15. File Structure: How the Code is Organized

Understanding the folder structure helps you navigate the codebase.

```
loma-app/
├── App.tsx                    # Entry point - wraps everything with providers
├── app.config.js              # Expo configuration (app name, icons, etc.)
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables (local only)
│
├── src/
│   ├── navigation/            # Screen routing
│   │   ├── RootNavigator.tsx     # Top-level: auth vs main app
│   │   ├── OnboardingNavigator.tsx # 11-step signup flow
│   │   └── MainTabNavigator.tsx   # Bottom tabs after login
│   │
│   ├── screens/               # UI screens
│   │   ├── auth/                 # Login, signup, email confirmation
│   │   ├── onboarding/           # All 11 onboarding screens
│   │   ├── main/                 # Home, recipes, cooking flow
│   │   └── settings/             # Profile, subscription
│   │
│   ├── services/              # Business logic
│   │   ├── auth/                 # Authentication logic
│   │   │   ├── authService.ts       # Sign up, login, logout
│   │   │   └── supabase.ts          # Supabase client setup
│   │   ├── recipes/              # Recipe operations
│   │   │   ├── recipeService.ts     # Generate, save, fetch recipes
│   │   │   └── recipeTransformers.ts # Convert data formats
│   │   ├── subscription/         # Payment logic
│   │   │   └── subscriptionService.ts # Tokens, portal, validation
│   │   ├── user/                 # User profile
│   │   │   └── userService.ts       # CRUD operations
│   │   └── progress/             # Stats & achievements
│   │       └── progressService.ts   # Streaks, completions
│   │
│   ├── context/               # Global state
│   │   ├── UserContext.tsx       # User data, auth state
│   │   └── RecipeContext.tsx     # Current recipe being viewed
│   │
│   ├── config/                # Configuration
│   │   └── env.ts               # Environment variable access
│   │
│   ├── components/            # Reusable UI components
│   │   └── ErrorBoundary.tsx    # Catches crashes gracefully
│   │
│   └── types/                 # TypeScript definitions
│       └── index.ts             # Shared types
│
├── supabase/
│   ├── functions/             # Edge Functions (backend code)
│   │   ├── create-payment-intent/
│   │   ├── stripe-webhook-handler/
│   │   ├── generate-recipe/
│   │   ├── deduct-token/
│   │   ├── validate-token-usage/
│   │   └── create-portal-session/
│   │
│   └── migrations/            # Database schema changes
│       └── *.sql                # SQL files to set up tables
│
└── assets/                    # Images, fonts, icons
    └── fonts/                   # Quicksand font family
```

### Key Files Explained

**App.tsx** - The starting point
```javascript
// Wraps everything with necessary providers
<ErrorBoundary>           // Catches crashes
  <StripeProvider>        // Payment capability
    <UserProvider>        // User state everywhere
      <RecipeProvider>    // Current recipe state
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </RecipeProvider>
    </UserProvider>
  </StripeProvider>
</ErrorBoundary>
```

**RootNavigator.tsx** - Decides what to show
```javascript
// If user is authenticated and onboarding complete → Main app
// If user is authenticated but needs to pay → Payment collection
// Otherwise → Onboarding flow
```

**UserContext.tsx** - Global user state
```javascript
// Stores: user profile, auth status, preferences
// Automatically syncs changes to Supabase
// Persists locally for offline access
```

---

## 16. Common Bugs and How We Fixed Them

Real bugs we encountered and their solutions.

### Bug #1: "Auth session missing" in Edge Functions

**Symptom:** Clicking "Manage Subscription" returned error: "Failed to get customer portal URL"

**Root Cause:** The Edge Function was using the wrong authentication pattern.

```javascript
// WRONG - Doesn't work in Edge Functions
const supabase = createClient(url, SUPABASE_ANON_KEY);
const { user } = await supabase.auth.getUser(); // Returns null!

// RIGHT - Pass the token manually
const supabase = createClient(url, SUPABASE_SERVICE_ROLE_KEY);
const token = req.headers.get('Authorization').replace('Bearer ', '');
const { user } = await supabase.auth.getUser(token); // Works!
```

**Lesson:** Edge Functions don't have automatic auth context. You must extract and pass the JWT token explicitly.

### Bug #2: Users Getting Wrong Token Amount

**Symptom:** Users signing up for Monthly ($7.99) were getting 28 tokens instead of 20.

**Root Cause:** Double allocation - database trigger gave 8 tokens on signup, then webhook added 20 more.

**Fix:** Webhook now REPLACES initial tokens instead of adding:
```javascript
// Before (wrong)
tokens_balance: currentBalance + planTokens  // 8 + 20 = 28

// After (correct)
tokens_balance: planTokens  // Just 20
```

### Bug #3: Race Condition on Token Deduction

**Symptom:** Fast double-clicks sometimes only deducted one token.

**Root Cause:** Both requests checked balance before either updated it.

**Fix:** Optimistic locking
```sql
UPDATE subscriptions
SET tokens_balance = tokens_balance - 1
WHERE user_id = $1
  AND tokens_balance = $2  -- Only if balance is what we expect
```

### Bug #4: App Crashed When Recipe Had No Instructions

**Symptom:** White screen when viewing certain recipes.

**Root Cause:** Code assumed `instructions` array always existed.

**Fix:** Added null check
```javascript
// Before
const steps = currentRecipe.instructions.filter(...)

// After
const steps = currentRecipe?.instructions?.length > 0
  ? currentRecipe.instructions.filter(...)
  : [];
```

### Bug #5: Session Not Persisting After App Restart

**Symptom:** Users had to log in every time they opened the app.

**Root Cause:** Custom storage key didn't match what Supabase expected.

**Fix:** Aligned storage key names
```javascript
// Storage key must match exactly
const STORAGE_KEY = 'auth-token';  // Not 'supabase.auth.token'
```

---

## 17. Cost Breakdown: What It Takes to Run an App

Understanding the economics of running LOMA.

### Fixed Costs (Monthly)

| Service | Free Tier | Paid Tier | Notes |
|---------|-----------|-----------|-------|
| Supabase | 500MB database, 2M Edge Function calls | $25/month for Pro | Free tier is generous |
| Sentry | 5K errors/month | $26/month | Free tier usually enough |
| Apple Developer | - | $99/year (~$8/month) | Required for App Store |
| Google Play | - | $25 one-time | Required for Play Store |

### Variable Costs (Per User)

| Cost | Amount | Notes |
|------|--------|-------|
| OpenAI (GPT-4o-mini) | ~$0.002 per generation | 4 recipes per generation |
| Stripe fees | 2.9% + $0.30 per transaction | $0.53 on a $7.99 charge |

### Revenue vs Cost (Monthly Plan)

```
User pays:                    $7.99
Stripe fee:                  -$0.53 (6.6%)
OpenAI (10 generations):     -$0.02
Infrastructure (allocated):  -$0.05
                             ------
Net per user:                 $7.39 (92.5% margin)
```

### Break-Even Analysis

```
Fixed costs: ~$50/month (conservative estimate)
Net per user: $7.39/month

Break-even: 50 / 7.39 = ~7 paying users

Profitable with: 50+ paying users
```

### At Scale (1,000 Users)

```
Revenue: 1,000 × $7.99 = $7,990
Stripe fees: -$530
OpenAI costs: -$20 (assuming 10 gen/user)
Infrastructure: $50 (still on free tiers mostly)
                ------
Net profit: ~$7,390/month
```

---

## 18. If I Was to Do It Again

Strategic advice for building an app like LOMA efficiently.

### Phase 0: Planning (Before Writing Any Code)

**Week 1: Define the Core**

1. **Identify the ONE thing your app does**
   - LOMA: "Personalized AI recipe generation"
   - Everything else is secondary

2. **Choose your tech stack wisely**
   - Don't reinvent wheels. Use managed services:
     - Auth: Supabase (not custom)
     - Payments: Stripe (not custom)
     - Database: Managed PostgreSQL (not self-hosted)

3. **Design the database schema FIRST**
   - What data do you need to store?
   - How do entities relate to each other?
   - What queries will you run frequently?

4. **Map out the user journey**
   - Every screen, every tap, every decision point
   - Identify where you need backend calls
   - Identify where you need third-party services

### Phase 1: Foundation (Authentication & Data)

**Week 2-3: Build the skeleton**

1. **Set up the project**
   ```bash
   npx create-expo-app loma-app --template
   ```

2. **Configure Supabase**
   - Create project
   - Set up database tables
   - Configure authentication
   - Enable RLS policies

3. **Build authentication flow**
   - Sign up screen
   - Login screen
   - Email verification
   - Session persistence

4. **Create the basic navigation**
   - Onboarding flow (can be placeholder screens)
   - Main tab navigator
   - Settings screens

**Key Insight:** Get a user from "open app" to "logged in on home screen" working end-to-end before building features.

### Phase 2: Payments (Before Features!)

**Week 4: Money first**

Why payments before features? Because:
- Many apps fail because they can't monetize
- Payment integration is complex - do it when codebase is small
- Validates that people will actually pay

1. **Set up Stripe**
   - Create account
   - Create products/prices
   - Configure webhooks

2. **Build Edge Functions**
   - `create-payment-intent`
   - `stripe-webhook-handler`

3. **Implement payment UI**
   - Plan selection
   - Stripe Payment Sheet
   - Success/failure handling

4. **Test extensively**
   - Use test cards
   - Verify webhooks work
   - Check database updates

### Phase 3: Core Feature (AI Generation)

**Week 5-6: The magic**

1. **Design the AI prompt**
   - What personalization data to include?
   - What output format do you need?
   - Test in OpenAI Playground first

2. **Build the Edge Function**
   - `generate-recipe`
   - Handle errors gracefully
   - Log costs for monitoring

3. **Connect to UI**
   - Loading states (AI takes 5-10 seconds)
   - Display results
   - Handle failures

4. **Implement token deduction**
   - Deduct AFTER successful generation
   - Free retry on failures

### Phase 4: Polish & Edge Cases

**Week 7-8: Make it solid**

1. **Error handling everywhere**
   - What if network fails?
   - What if user has no tokens?
   - What if AI returns garbage?

2. **Set up error tracking**
   - Install Sentry
   - Test that errors get reported

3. **Optimize performance**
   - Loading states
   - Caching where appropriate

4. **Test on real devices**
   - iOS and Android
   - Different screen sizes
   - Slow network conditions

### Key Lessons Learned

**1. Start with managed services**
Don't build auth yourself. Don't build payment processing yourself. Don't manage your own servers. Use Supabase, Stripe, and other managed services. You can always migrate later if needed.

**2. Security from day one**
It's much harder to add security later. Start with:
- RLS policies on every table
- Server-side validation for critical operations
- Secrets in environment variables, not code

**3. Test payment flow early and often**
Payments are complex. The interaction between Stripe, webhooks, and your database has many edge cases. Test with every Stripe test card scenario.

**4. Log everything (for now)**
During development, over-log. You can remove logs later, but you can't debug what you didn't log.

**5. Handle errors gracefully**
Users will encounter errors. The question is: do they see a white screen, or a helpful message?

**6. Use TypeScript**
It catches bugs before they happen. Worth the initial learning curve.

**7. Document as you go**
Not for others - for yourself in 3 months when you've forgotten why you did something.

### The Prompt Sequence (If Using AI Assistance)

If I were to rebuild LOMA with Claude Code from scratch, here's the strategic prompt sequence:

**Prompt 1:** "Help me set up a new React Native Expo project with TypeScript, React Navigation, and the basic folder structure for a mobile app."

**Prompt 2:** "I need to integrate Supabase for authentication and database. Here's my schema: [provide schema]. Set up the client, auth service, and RLS policies."

**Prompt 3:** "Build a 10-screen onboarding flow that collects [specific data]. Use React Navigation stack navigator. Each screen should save data to context."

**Prompt 4:** "Integrate Stripe payments with Supabase Edge Functions. I need subscription-based payments with these plans: [plans]. Include webhook handling."

**Prompt 5:** "Build an Edge Function that calls OpenAI to generate recipes based on user preferences. Here's the prompt template I want to use: [template]."

**Prompt 6:** "Connect the AI generation to the home screen. Include token validation, deduction after success, loading states, and error handling."

**Prompt 7:** "Add Sentry error tracking to the app. Configure it to track errors, performance, and user interactions."

**Prompt 8:** "Review the entire app for security issues. Check for: exposed secrets, client-side validation that should be server-side, missing RLS policies, etc."

### Final Thoughts

Building an app is a marathon, not a sprint. The technology choices you make early will either support you or haunt you later. Choose boring, proven technologies. Use managed services. Focus on the core feature that makes your app unique, and use off-the-shelf solutions for everything else.

The goal isn't to write the most code - it's to deliver value to users with the least complexity possible.

---

*This guide was created from the complete LOMA development journey, including all code, documentation, bug fixes, and lessons learned along the way.*

*Last Updated: November 26th, 2025*
