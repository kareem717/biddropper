-- +goose Up
-- +goose StatementBegin
ALTER TABLE addresses
ADD COLUMN raw_json jsonb NULL,
ADD COLUMN district TEXT NULL,
ADD COLUMN region_code TEXT NULL,
ADD COLUMN full_address TEXT NOT NULL;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE addresses
DROP COLUMN raw_json,
DROP COLUMN district,
DROP COLUMN region_code,
DROP COLUMN full_address;

-- +goose StatementEnd