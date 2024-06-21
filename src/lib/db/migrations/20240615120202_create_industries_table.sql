-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    industries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        NAME VARCHAR(255) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_industry_updated_at BEFORE
UPDATE ON industries FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_industry_updated_at ON industries;

DROP TABLE industries;

-- +goose StatementEnd