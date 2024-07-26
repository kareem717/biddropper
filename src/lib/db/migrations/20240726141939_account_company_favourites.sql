-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    account_company_favourites (
        account_id UUID NOT NULL REFERENCES accounts,
        company_id UUID NOT NULL REFERENCES companies,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz,
        PRIMARY KEY (account_id, company_id)
    );

CREATE TRIGGER sync_account_company_favourites_updated_at BEFORE
UPDATE ON account_company_favourites FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_account_company_favourites_updated_at ON account_company_favourites;

DROP TABLE account_company_favourites;

-- +goose StatementEnd