-- +goose Up
-- +goose StatementBegin
ALTER TABLE jobs
DROP COLUMN tags;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE jobs
ADD COLUMN tags VARCHAR[];

-- +goose StatementEnd