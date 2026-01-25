/*
  Warnings:

  - You are about to drop the column `coverImageUrl` on the `trips` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trips" DROP COLUMN "coverImageUrl",
ADD COLUMN     "cover_image_url" TEXT;
