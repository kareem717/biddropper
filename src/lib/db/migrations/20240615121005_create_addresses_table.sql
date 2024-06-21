-- +goose Up
-- +goose StatementBegin

CREATE TABLE
    addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        x_coordinate NUMERIC NOT NULL,
        y_coordinate NUMERIC NOT NULL,
        line_1 VARCHAR(70),
        line_2 VARCHAR(70),
        city VARCHAR(50),
        region VARCHAR(50),
        postal_code VARCHAR(10) NOT NULL,
        country VARCHAR(60) NOT NULL,
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


-- +goose StatementEnd