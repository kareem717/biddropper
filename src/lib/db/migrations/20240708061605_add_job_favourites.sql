-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    account_job_favourites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        account_id UUID NOT NULL REFERENCES accounts,
        job_id UUID NOT NULL REFERENCES jobs,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_messages_updated_at BEFORE
UPDATE ON account_job_favourites FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_messages_updated_at ON account_job_favourites;

DROP TABLE account_job_favourites;

-- +goose StatementEnd