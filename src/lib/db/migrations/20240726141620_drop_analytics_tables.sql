-- +goose Up
-- +goose StatementBegin
SELECT
    cron.unschedule ('reset-company-monthly-analytics');

SELECT
    cron.unschedule ('reset-company-weekly-analytics');

DROP TRIGGER sync_company_analytics_updated_at ON company_analytics;

DROP TABLE company_analytics;

SELECT
    cron.unschedule ('reset-job-monthly-analytics');

SELECT
    cron.unschedule ('reset-job-weekly-analytics');

DROP TRIGGER sync_job_analytics_updated_at ON job_analytics;

DROP TABLE job_analytics;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
CREATE TABLE
    job_analytics (
        job_id UUID PRIMARY KEY REFERENCES jobs (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        weekly_views BIGINT NOT NULL DEFAULT 0,
        monthly_views BIGINT NOT NULL DEFAULT 0,
        weekly_bids_received BIGINT NOT NULL DEFAULT 0,
        monthly_bids_received BIGINT NOT NULL DEFAULT 0,
        weekly_favourites BIGINT NOT NULL DEFAULT 0,
        monthly_favourites BIGINT NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_job_analytics_updated_at BEFORE
UPDATE ON job_analytics FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

SELECT
    cron.schedule (
        'reset-job-weekly-analytics',
        '0 4 * * 1',
        $$
        UPDATE
            job_analytics
        SET
            weekly_views = 0,
            weekly_bids_received = 0,
            weekly_favourites = 0
        WHERE
            deleted_at IS NULL
        $$
    );

SELECT
    cron.schedule (
        'reset-job-monthly-analytics',
        '0 4 * * 1',
        $$
        UPDATE
            job_analytics
        SET
            monthly_views = 0,
            monthly_bids_received = 0,
            monthly_favourites = 0
        WHERE
            deleted_at IS NULL
        $$
    );

CREATE TABLE
    company_analytics (
        company_id UUID PRIMARY KEY REFERENCES companies (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        weekly_views BIGINT NOT NULL DEFAULT 0,
        monthly_views BIGINT NOT NULL DEFAULT 0,
        weekly_bids_received BIGINT NOT NULL DEFAULT 0,
        monthly_bids_received BIGINT NOT NULL DEFAULT 0,
        weekly_favourites BIGINT NOT NULL DEFAULT 0,
        monthly_favourites BIGINT NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_company_analytics_updated_at BEFORE
UPDATE ON company_analytics FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

SELECT
    cron.schedule (
        'reset-company-weekly-analytics',
        '0 4 * * 1',
        $$
        UPDATE
            company_analytics
        SET
            weekly_views = 0,
            weekly_bids_received = 0,
            weekly_favourites = 0
        WHERE
            deleted_at IS NULL
        $$
    );

SELECT
    cron.schedule (
        'reset-company-monthly-analytics',
        '0 4 * * 1',
        $$
        UPDATE
            company_analytics
        SET
            monthly_views = 0,
            monthly_bids_received = 0,
            monthly_favourites = 0
        WHERE
            deleted_at IS NULL
        $$
    );
-- +goose StatementEnd