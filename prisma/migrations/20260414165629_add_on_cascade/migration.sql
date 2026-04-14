-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "links" DROP CONSTRAINT "links_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_trip_id_fkey";

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
