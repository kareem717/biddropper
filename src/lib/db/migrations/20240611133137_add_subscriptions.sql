-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    account_subscriptions (
        account_id UUID PRIMARY KEY REFERENCES accounts (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        stripe_customer_id VARCHAR(255) NOT NULL,
        stripe_subscription_id VARCHAR(255) NOT NULL,
        stripe_price_id VARCHAR(255) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_account_subscriptions_updated_at BEFORE
UPDATE ON account_subscriptions FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_account_subscriptions_updated_at ON account_subscriptions;

DROP TABLE account_subscriptions;

-- +goose StatementEnd