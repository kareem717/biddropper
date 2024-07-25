-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION pg_cron;

CREATE TABLE
    company_analytics (
        company_id UUID PRIMARY KEY REFERENCES companies (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        monthly_profile_views BIGINT NOT NULL DEFAULT 0,
        monthly_bids_received BIGINT NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_company_analytics_updated_at BEFORE
UPDATE ON company_analytics FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

SELECT
    cron.schedule (
        'reset-company-monthly-analytics',
        '0 4 1 * *',
        $$UPDATE company_analytics SET monthly_profile_views = 0, monthly_bids_received = 0$$
    );

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
SELECT
    cron.unschedule ('reset-company-monthly-analytics');

DROP EXTENSION pg_cron;

DROP TRIGGER sync_company_analytics_updated_at ON company_analytics;

DROP TABLE company_analytics;

-- +goose StatementEnd