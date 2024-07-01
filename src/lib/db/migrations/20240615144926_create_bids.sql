-- +goose Up
-- +goose StatementBegin
CREATE TYPE bid_status AS ENUM('pending', 'accepted', 'rejected', 'withdrawn');

CREATE TABLE
    bids (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        price NUMERIC(10, 2) NOT NULL,
        sender_company_id UUID NOT NULL REFERENCES companies (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        status bid_status DEFAULT 'pending'::bid_status NOT NULL,
        note VARCHAR(100),
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_bids_updated_at BEFORE
UPDATE ON bids FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_bids_updated_at ON bids;

DROP TABLE bids;

DROP TYPE bid_status;

-- +goose StatementEnd