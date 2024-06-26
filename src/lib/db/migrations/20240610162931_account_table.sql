-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        username TEXT NOT NULL,
        description TEXT,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_account_updated_at BEFORE
UPDATE ON accounts FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_account_updated_at ON accounts;

DROP TABLE accounts;

-- +goose StatementEnd