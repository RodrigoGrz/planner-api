-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "confirmation_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "participants_confirmation_token_key" ON "participants"("confirmation_token");
