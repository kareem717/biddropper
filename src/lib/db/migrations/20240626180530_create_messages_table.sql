-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        account_id UUID NOT NULL REFERENCES accounts ON UPDATE CASCADE ON DELETE RESTRICT,
        description TEXT NOT NULL,
        title VARCHAR(100) NOT NULL,
        read_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_messages_updated_at BEFORE
UPDATE ON messages FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS sync_messages_updated_at ON messages;

DROP TABLE IF EXISTS messages;

-- +goose StatementEnd