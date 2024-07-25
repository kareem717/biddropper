-- +goose Up
-- +goose StatementBegin
DROP TRIGGER sync_job_view_history_updated_at ON job_view_history;

DROP TABLE job_view_history;

CREATE TABLE
    account_view_histories (
        id UUID DEFAULT gen_random_uuid () NOT NULL PRIMARY KEY,
        account_id UUID NOT NULL REFERENCES accounts,
        job_id UUID REFERENCES jobs,
        company_id UUID REFERENCES companies,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        CHECK (
            (
                job_id IS NOT NULL
                AND company_id IS NULL
            )
            OR (
                job_id IS NULL
                AND company_id IS NOT NULL
            )
        )
    );

CREATE INDEX account_view_histories_account_id_idx ON account_view_histories (account_id);

CREATE INDEX account_view_histories_company_id_idx ON account_view_histories (company_id);

CREATE INDEX account_view_histories_job_id_idx ON account_view_histories (job_id);

CREATE TRIGGER sync_account_view_histories_updated_at BEFORE
UPDATE ON account_view_histories FOR EACH ROW
EXECUTE PROCEDURE sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_account_view_histories_updated_at ON account_view_histories;

DROP TABLE account_view_histories;

CREATE TABLE
    job_view_history (
        id UUID DEFAULT gen_random_uuid () NOT NULL PRIMARY KEY,
        account_id UUID NOT NULL REFERENCES accounts,
        job_id UUID NOT NULL REFERENCES jobs,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE,
        deleted_at TIMESTAMP WITH TIME ZONE
    );

CREATE TRIGGER sync_job_view_history_updated_at BEFORE
UPDATE ON job_view_history FOR EACH ROW
EXECUTE PROCEDURE sync_updated_at_column ();

-- +goose StatementEnd