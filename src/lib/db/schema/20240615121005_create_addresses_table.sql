-- +goose Up
-- +goose StatementBegin
CREATE TYPE time_zone AS (NAME VARCHAR, utc_offset_seconds BIGINT);

CREATE TABLE
    addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        street VARCHAR,
        unit VARCHAR,
        city VARCHAR,
        region VARCHAR,
        postal_code VARCHAR,
        country VARCHAR,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_address_updated_at BEFORE
UPDATE ON addresses FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_address_updated_at ON addresses;

DROP TABLE addresses;

DROP TYPE time_zone;

-- +goose StatementEnd