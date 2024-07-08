-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    job_view_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        account_id UUID NOT NULL REFERENCES accounts,
        job_id UUID NOT NULL REFERENCES jobs,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_messages_updated_at BEFORE
UPDATE ON job_view_history FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_messages_updated_at ON job_view_history;

DROP TABLE job_view_history;

-- +goose StatementEnd