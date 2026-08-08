CREATE TABLE coupon_deletion_history_250618 (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deleted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    entity_type VARCHAR(20) NOT NULL CHECK (
        entity_type IN ('definition', 'instance')
    ),
    entity_id VARCHAR(50) NOT NULL,
    deleted_by VARCHAR(100),
    source VARCHAR(100),
    snapshot JSONB NOT NULL
);

CREATE INDEX coupon_deletion_history_250618_entity_idx
    ON coupon_deletion_history_250618 (entity_type, entity_id, deleted_at DESC);
