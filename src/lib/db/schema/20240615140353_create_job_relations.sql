-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    contract_jobs (
        job_id UUID NOT NULL REFERENCES jobs ON UPDATE CASCADE ON DELETE RESTRICT,
        contract_id UUID NOT NULL REFERENCES contracts ON UPDATE CASCADE ON DELETE RESTRICT,
        PRIMARY KEY (job_id, contract_id)
    );

CREATE TABLE
    user_jobs (
        job_id UUID NOT NULL REFERENCES jobs ON UPDATE CASCADE ON DELETE RESTRICT,
        user_id UUID NOT NULL REFERENCES accounts ON UPDATE CASCADE ON DELETE RESTRICT,
        PRIMARY KEY (job_id, user_id)
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
DROP TABLE contract_jobs;

DROP TABLE user_jobs;

DROP TABLE company_jobs;

-- +goose StatementEnd

