# Stripe Organization API Key Error

## Problem
Billing flow was returning a 500 error with the message:
```
Please include the Stripe-Context header with your target account when using an Organization API key.
```

## Root Cause
The production environment is using a Stripe **Organization API key** (format: `sk_live_org_...` or `sk_test_org_...`) instead of a regular **Account API key** (format: `sk_live_...` or `sk_test_...`).

Organization API keys are used for Stripe Connect platforms and require a `Stripe-Context` header to specify which connected account to use.

## Solution
Replace the `STRIPE_SECRET` environment variable with a regular account-level Stripe API key:

1. Go to your Stripe Dashboard: https://dashboard.stripe.com/apikeys
2. Generate a new **Secret key** (not an Organization key)
3. Update the `STRIPE_SECRET` environment variable in Laravel Cloud with the new key

The key should look like:
- Test: `sk_test_...` (starts with `sk_test_`, not `sk_test_org_`)
- Live: `sk_live_...` (starts with `sk_live_`, not `sk_live_org_`)

## Additional Fixes Made
1. Added null-safety checks in `BillingController.php` for Stripe API failures
2. Wrapped Stripe API calls in try-catch to gracefully handle errors
3. Updated frontend billing pages to handle null `intent` prop when Stripe API fails

## Date
December 1, 2025
