ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "emailVerifyToken" TEXT;
ALTER TABLE "users" ADD COLUMN "emailVerifyExpiry" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE "users" ADD COLUMN "passwordResetExpiry" TIMESTAMP(3);
CREATE UNIQUE INDEX "users_emailVerifyToken_key" ON "users"("emailVerifyToken");
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");
