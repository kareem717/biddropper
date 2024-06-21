-- +goose Up
-- +goose StatementBegin
ALTER TABLE accounts
ADD COLUMN description TEXT;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE accounts
DROP COLUMN description;

-- +goose StatementEnd