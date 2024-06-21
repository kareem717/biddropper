-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    contracts (
        id UUID NOT NULL PRIMARY KEY,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(3000) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        price_currency VARCHAR(3) NOT NULL,
        expiry_date timestamptz DEFAULT NULL,
        company_id UUID NOT NULL REFERENCES companies (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        tags VARCHAR[] DEFAULT '{}'::VARCHAR[] NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_contracts_updated_at BEFORE
UPDATE ON contracts FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_contracts_updated_at ON contracts;

DROP TABLE contracts;

-- +goose StatementEnd