-- +goose Up
-- +goose StatementBegin
ALTER TABLE job_recommendation_history
RENAME TO account_job_reccomendation_histories;

ALTER TRIGGER sync_job_recommendation_history_updated_at ON account_job_reccomendation_histories
RENAME TO sync_account_job_reccomendation_histories_updated_at;

CREATE TABLE
    account_company_reccomendation_histories (
        id UUID DEFAULT gen_random_uuid () NOT NULL PRIMARY KEY,
        account_id UUID NOT NULL REFERENCES accounts,
        company_id UUID NOT NULL REFERENCES companies,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE,
        deleted_at TIMESTAMP WITH TIME ZONE
    );

CREATE TRIGGER sync_account_company_reccomendation_histories_updated_at BEFORE
UPDATE ON account_company_reccomendation_histories FOR EACH ROW
EXECUTE PROCEDURE sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_account_company_reccomendation_histories_updated_at ON account_company_reccomendation_histories;

DROP TABLE account_company_reccomendation_histories;

ALTER TABLE account_job_reccomendation_histories
RENAME TO job_recommendation_history;

ALTER TRIGGER sync_account_job_reccomendation_histories_updated_at ON job_recommendation_history
RENAME TO sync_job_recommendation_history_updated_at;

-- +goose StatementEnd