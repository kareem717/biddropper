-- +goose Up
-- +goose StatementBegin
DROP TRIGGER sync_job_view_history_updated_at ON job_view_history;

DROP TABLE job_view_history;

CREATE TABLE
    account_job_view_histories (
        id UUID DEFAULT gen_random_uuid () NOT NULL PRIMARY KEY,
        account_id UUID NOT NULL REFERENCES accounts,
        job_id UUID NOT NULL REFERENCES jobs,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE,
        deleted_at TIMESTAMP WITH TIME ZONE
    );

CREATE TRIGGER sync_account_job_view_histories_updated_at BEFORE
UPDATE ON account_job_view_histories FOR EACH ROW
EXECUTE PROCEDURE sync_updated_at_column ();

CREATE TABLE
    account_company_view_histories (
        id UUID DEFAULT gen_random_uuid () NOT NULL PRIMARY KEY,
        account_id UUID NOT NULL REFERENCES accounts,
        company_id UUID NOT NULL REFERENCES companies,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE,
        deleted_at TIMESTAMP WITH TIME ZONE
    );

CREATE TRIGGER sync_account_company_view_histories_updated_at BEFORE
UPDATE ON account_company_view_histories FOR EACH ROW
EXECUTE PROCEDURE sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_account_job_view_histories_updated_at ON account_job_view_histories;

DROP TABLE account_job_view_histories;

DROP TRIGGER sync_account_company_view_histories_updated_at ON account_company_view_histories;

DROP TABLE account_company_view_histories;

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