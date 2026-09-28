SET check_function_bodies = false;
SET search_path = public, extensions, pg_catalog;
CREATE VIEW "public"."missions_master" AS  SELECT id,
    category
   FROM missions;
