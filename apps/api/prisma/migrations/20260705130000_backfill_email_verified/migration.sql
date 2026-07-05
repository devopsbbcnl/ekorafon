-- Backfill: all users created before email verification was introduced
-- are treated as already verified so existing accounts are not locked out.
UPDATE "users" SET "emailVerified" = true WHERE "emailVerified" = false;
