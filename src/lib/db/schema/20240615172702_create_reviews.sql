-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    reviews (
        id UUID PRIMARY KEY,
        author_id UUID NOT NULL REFERENCES accounts ON UPDATE CASCADE ON DELETE RESTRICT,
        rating NUMERIC(2, 1) NOT NULL,
        description TEXT NOT NULL,
        title VARCHAR(100) NOT NULL,
        company_id UUID NOT NULL REFERENCES companies ON UPDATE CASCADE ON DELETE RESTRICT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_reviews_updated_at BEFORE
UPDATE ON reviews FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_reviews_updated_at ON reviews;

DROP TABLE reviews;

-- +goose StatementEnd