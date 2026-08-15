-- Add explicit definition/instance ID columns for Feature005 history display.
-- Safe to re-run: ADD COLUMN IF NOT EXISTS; backfill only fills NULLs.

ALTER TABLE coupon_deletion_history_250618
    ADD COLUMN IF NOT EXISTS definitions_id VARCHAR(50);

ALTER TABLE coupon_deletion_history_250618
    ADD COLUMN IF NOT EXISTS instances_id VARCHAR(50);

-- Backfill from existing entity_id + snapshot (no entity_id changes).
UPDATE coupon_deletion_history_250618
SET
    definitions_id = CASE
        WHEN entity_type = 'definition' THEN entity_id
        WHEN entity_type = 'instance' THEN snapshot->>'coupon_definition_id'
        ELSE definitions_id
    END,
    instances_id = CASE
        WHEN entity_type = 'instance' THEN entity_id
        WHEN entity_type = 'definition' THEN NULL
        ELSE instances_id
    END
WHERE definitions_id IS NULL
   OR (entity_type = 'instance' AND instances_id IS NULL)
   OR (entity_type = 'definition' AND instances_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS coupon_deletion_history_250618_definitions_idx
    ON coupon_deletion_history_250618 (definitions_id, deleted_at DESC);

CREATE INDEX IF NOT EXISTS coupon_deletion_history_250618_instances_idx
    ON coupon_deletion_history_250618 (instances_id, deleted_at DESC);
