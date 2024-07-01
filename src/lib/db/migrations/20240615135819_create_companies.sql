-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    companies (
        id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
        NAME VARCHAR(50) NOT NULL,
        owner_id UUID NOT NULL REFERENCES accounts ON UPDATE CASCADE ON DELETE RESTRICT,
        address_id UUID NOT NULL REFERENCES addresses ON UPDATE CASCADE ON DELETE RESTRICT,
        service_area NUMERIC(7, 3),
        email_address VARCHAR(320) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        website_url TEXT,
        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
        date_founded DATE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_companies_updated_at BEFORE
UPDATE ON companies FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_companies_updated_at ON companies;

DROP TABLE companies;

-- +goose StatementEnd