-- +goose Up
-- +goose StatementBegin
ALTER TABLE messages
DROP COLUMN read_at;

ALTER TABLE message_account_recipients
ADD COLUMN read_at timestamptz;

ALTER TABLE message_account_recipients
ADD COLUMN deleted_at timestamptz;

ALTER TABLE message_company_recipients
ADD COLUMN read_at timestamptz;

ALTER TABLE message_company_recipients
ADD COLUMN deleted_at timestamptz;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE messages
ADD COLUMN read_at timestamptz;

ALTER TABLE message_account_recipients
DROP COLUMN read_at;

ALTER TABLE message_account_recipients
DROP COLUMN deleted_at;

ALTER TABLE message_company_recipients
DROP COLUMN read_at;

ALTER TABLE message_company_recipients
DROP COLUMN deleted_at;

-- +goose StatementEnd