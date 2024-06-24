-- +goose Up
-- +goose StatementBegin
ALTER TABLE bids
RENAME COLUMN price TO price_usd;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE bids
RENAME COLUMN price_usd TO price;

-- +goose StatementEnd