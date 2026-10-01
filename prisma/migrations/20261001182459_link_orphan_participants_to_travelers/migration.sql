UPDATE "participants" p
SET "traveler_id" = t."id", "name" = t."name"
FROM "travelers" t
WHERE p."traveler_id" IS NULL
  AND lower(p."email") = lower(t."email")
  AND (
    SELECT count(*) FROM "travelers" t2
    WHERE lower(t2."email") = lower(p."email")
  ) = 1
  AND NOT EXISTS (
    SELECT 1 FROM "participants" p2
    WHERE p2."trip_id" = p."trip_id" AND p2."traveler_id" = t."id"
  );
