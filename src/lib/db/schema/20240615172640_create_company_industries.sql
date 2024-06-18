-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    company_industries (
        company_id UUID NOT NULL REFERENCES companies (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        industry_id UUID NOT NULL REFERENCES industries (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        PRIMARY KEY (company_id, industry_id)
    );

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE company_industries;

-- +goose StatementEnd