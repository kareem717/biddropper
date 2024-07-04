-- +goose Up
-- +goose StatementBegin
ALTER TABLE messages
DROP COLUMN account_id;

ALTER TABLE messages
ADD COLUMN sender_company_id UUID REFERENCES companies ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE messages
ADD COLUMN sender_account_id UUID REFERENCES accounts ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE messages
ADD CONSTRAINT check_sender_not_null CHECK (
    sender_company_id IS NOT NULL
    OR sender_account_id IS NOT NULL
);

CREATE TABLE
    message_company_recipients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        message_id UUID NOT NULL REFERENCES messages ON UPDATE CASCADE ON DELETE RESTRICT,
        company_id UUID NOT NULL REFERENCES companies ON UPDATE CASCADE ON DELETE RESTRICT
    );

CREATE TABLE
    message_account_recipients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        message_id UUID NOT NULL REFERENCES messages ON UPDATE CASCADE ON DELETE RESTRICT,
        account_id UUID NOT NULL REFERENCES accounts ON UPDATE CASCADE ON DELETE RESTRICT
    );

CREATE TABLE
    message_thread (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        message_id UUID REFERENCES messages ON UPDATE CASCADE ON DELETE RESTRICT,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_message_thread_updated_at BEFORE
UPDATE ON message_thread FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE messages
ADD COLUMN account_id UUID REFERENCES accounts ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE messages
DROP COLUMN sender_company_id;

ALTER TABLE messages
DROP COLUMN sender_account_id;

ALTER TABLE messages
DROP CONSTRAINT check_sender_not_null;

DROP TABLE message_company_recipients;

DROP TABLE message_account_recipients;

DROP TRIGGER sync_message_thread_updated_at ON message_thread;

DROP TABLE message_thread;

-- +goose StatementEnd