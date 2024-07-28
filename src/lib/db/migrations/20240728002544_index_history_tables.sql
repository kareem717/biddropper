-- +goose Up
-- +goose StatementBegin
CREATE INDEX idx_account_job_view_histories_account_id ON account_job_view_histories (account_id)
WHERE
    deleted_at IS NULL;

CREATE INDEX idx_account_company_view_histories_account_id ON account_company_view_histories (account_id)
WHERE
    deleted_at IS NULL;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_account_job_view_histories_account_id;

DROP INDEX idx_account_company_view_histories_account_id;

-- +goose StatementEnd