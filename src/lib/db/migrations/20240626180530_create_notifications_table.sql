-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    notifications (
        id UUID PRIMARY KEY,
        account_id UUID NOT NULL REFERENCES accounts ON UPDATE CASCADE ON DELETE RESTRICT,
        description TEXT NOT NULL,
        title VARCHAR(100) NOT NULL,
        is_archived BOOLEAN DEFAULT FALSE NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_notifications_updated_at BEFORE
UPDATE ON notifications FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS sync_notifications_updated_at ON notifications;

DROP TABLE IF EXISTS notifications;

-- +goose StatementEnd