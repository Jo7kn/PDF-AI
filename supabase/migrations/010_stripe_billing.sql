-- Stripe replaces Lemon Squeezy as the billing provider. Adds the Stripe-side identity
-- columns; the lemonsqueezy_* columns from 006_credits_and_usage.sql are left in place
-- (unused going forward, not dropped) rather than migrated, since there's no live Lemon
-- Squeezy subscription data worth preserving.
--
-- IF NOT EXISTS throughout: `subscription_status` and `lemonsqueezy_customer_id` are
-- referenced in application code (lib/lemonsqueezy.ts callers, getCurrentUserProfile) but
-- were never actually created by any prior migration — either added by hand directly in
-- the Supabase SQL editor at some point, or the webhook has been erroring on those columns
-- this whole time. This migration is safe to run regardless of which is true.

ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100);
