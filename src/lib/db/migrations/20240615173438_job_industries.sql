-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    job_industries (
        job_id UUID NOT NULL REFERENCES jobs (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        industry_id UUID NOT NULL REFERENCES industries (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        PRIMARY KEY (job_id, industry_id)
    );

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE job_industries;

-- +goose StatementEnd