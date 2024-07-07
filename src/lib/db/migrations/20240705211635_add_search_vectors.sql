-- +goose Up
-- +goose StatementBegin
ALTER TABLE jobs
ADD COLUMN english_search_vector tsvector GENERATED ALWAYS AS (
    SETWEIGHT(TO_TSVECTOR('english', title), 'A')||SETWEIGHT(TO_TSVECTOR('english', description), 'B')
) STORED;

ALTER TABLE messages
ADD COLUMN english_search_vector tsvector GENERATED ALWAYS AS (
    SETWEIGHT(TO_TSVECTOR('english', title), 'A')||SETWEIGHT(TO_TSVECTOR('english', description), 'B')
) STORED;

ALTER TABLE companies
ADD COLUMN english_search_vector tsvector GENERATED ALWAYS AS (TO_TSVECTOR('english', NAME)) STORED;

ALTER TABLE accounts
ADD COLUMN english_search_vector tsvector GENERATED ALWAYS AS (TO_TSVECTOR('english', username)) STORED;

CREATE INDEX jobs_english_search_vector_idx ON jobs USING gin (english_search_vector);

CREATE INDEX messages_english_search_vector_idx ON messages USING gin (english_search_vector);

CREATE INDEX companies_english_search_vector_idx ON companies USING gin (english_search_vector);

CREATE INDEX accounts_english_search_vector_idx ON accounts USING gin (english_search_vector);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP INDEX jobs_english_search_vector_idx;

DROP INDEX messages_english_search_vector_idx;

DROP INDEX companies_english_search_vector_idx;

DROP INDEX accounts_english_search_vector_idx;

ALTER TABLE jobs
DROP COLUMN english_search_vector;

ALTER TABLE messages
DROP COLUMN english_search_vector;

ALTER TABLE companies
DROP COLUMN english_search_vector;

ALTER TABLE accounts
DROP COLUMN english_search_vector;

-- +goose StatementEnd