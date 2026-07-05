-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'RELEASED';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "releasedAt" TIMESTAMP(3),
ADD COLUMN     "releasedBy" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false;
