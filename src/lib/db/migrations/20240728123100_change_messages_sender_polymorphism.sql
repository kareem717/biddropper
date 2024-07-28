-- +goose Up
-- +goose StatementBegin
ALTER TABLE messages
DROP CONSTRAINT check_sender_not_null;

ALTER TABLE messages
ADD CONSTRAINT check_sender_polymorphic CHECK (
    (
        sender_company_id IS NOT NULL
        AND sender_account_id IS NULL
    )
    OR (
        sender_account_id IS NOT NULL
        AND sender_company_id IS NULL
    )
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE messages
DROP CONSTRAINT check_sender_polymorphic;

ALTER TABLE messages
ADD CONSTRAINT check_sender_not_null CHECK (
    sender_company_id IS NOT NULL
    OR sender_account_id IS NOT NULL
);

-- +goose StatementEnd