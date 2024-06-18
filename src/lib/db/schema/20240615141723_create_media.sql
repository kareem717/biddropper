-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        url TEXT NOT NULL,
        type text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_media_updated_at BEFORE
UPDATE ON media FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_media_updated_at ON media;

DROP TABLE media;

-- +goose StatementEnd