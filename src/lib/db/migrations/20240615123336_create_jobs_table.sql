-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        is_commercial_property BOOLEAN DEFAULT FALSE NOT NULL,
        description VARCHAR(3000) NOT NULL,
        start_date timestamptz NOT NULL,
        end_date timestamptz DEFAULT NULL,
        start_date_flag start_date_flag DEFAULT 'none'::start_date_flag NOT NULL,
        property_type enum_jobs_property_type NOT NULL,
        address_id UUID NOT NULL REFERENCES addresses ON UPDATE CASCADE ON DELETE RESTRICT,
        title VARCHAR(100) NOT NULL,
        tags VARCHAR[],
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_jobs_updated_at BEFORE
UPDATE ON jobs FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_jobs_updated_at ON jobs;

DROP TABLE jobs;

-- +goose StatementEnd