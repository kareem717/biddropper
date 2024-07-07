-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    account_jobs (
        job_id UUID NOT NULL REFERENCES jobs ON UPDATE CASCADE ON DELETE RESTRICT,
        account_id UUID NOT NULL REFERENCES accounts ON UPDATE CASCADE ON DELETE RESTRICT,
        PRIMARY KEY (job_id, account_id)
    );

CREATE TABLE
    company_jobs (
        job_id UUID NOT NULL REFERENCES jobs ON UPDATE CASCADE ON DELETE RESTRICT,
        company_id UUID NOT NULL REFERENCES companies ON UPDATE CASCADE ON DELETE RESTRICT,
        PRIMARY KEY (job_id, company_id)
    );

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin

DROP TABLE account_jobs;

DROP TABLE company_jobs;

-- +goose StatementEnd

