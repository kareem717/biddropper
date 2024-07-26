-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    daily_company_aggregate_analytics (
        company_id UUID NOT NULL REFERENCES companies,
        day_number INT NOT NULL,
        view_count INT NOT NULL DEFAULT 0,
        bids_recieved_count INT NOT NULL DEFAULT 0,
        favourited_count INT NOT NULL DEFAULT 0,
        reccomended_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        PRIMARY KEY (company_id, day_number)
    );

CREATE TRIGGER sync_daily_company_aggregate_analytics_updated_at BEFORE
UPDATE ON daily_company_aggregate_analytics FOR EACH ROW
EXECUTE PROCEDURE sync_updated_at_column ();

CREATE
OR REPLACE FUNCTION set_day_number () RETURNS TRIGGER AS $$
BEGIN
    NEW.day_number := EXTRACT(DAY FROM NEW.created_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_day_number_trigger BEFORE INSERT ON daily_company_aggregate_analytics FOR EACH ROW
EXECUTE FUNCTION set_day_number ();

SELECT
    cron.schedule (
        'update-daily-company-view-count',
        '0 4 * * *',
        $$
        WITH view_counts AS (
            SELECT company_id, count(*) AS view_count
            FROM account_company_view_histories
            WHERE created_at > NOW() - INTERVAL '1 day'
            GROUP BY company_id
        )
        INSERT INTO daily_company_aggregate_analytics (company_id, view_count)
        SELECT company_id, view_count FROM view_counts
        ON CONFLICT (company_id, day_number) DO UPDATE
        SET view_count = EXCLUDED.view_count;
        $$
    );

CREATE INDEX idx_account_company_view_histories_company_id_created_at ON account_company_view_histories (company_id, created_at);

SELECT
    cron.schedule (
        'update-daily-company-bids-received-count',
        '0 4 * * *',
        $$
        WITH bid_counts AS (
            SELECT cb.company_id, count(*) AS bids_recieved_count
            FROM bids b
            INNER JOIN job_bids jb ON jb.bid_id = b.id
            INNER JOIN company_jobs cb ON cb.job_id = jb.job_id
            WHERE b.created_at > NOW() - INTERVAL '1 day'
            GROUP BY cb.company_id
        )
        INSERT INTO daily_company_aggregate_analytics (company_id, bids_recieved_count)
        SELECT company_id, bids_recieved_count FROM bid_counts
        ON CONFLICT (company_id, day_number) DO UPDATE
        SET bids_recieved_count = EXCLUDED.bids_recieved_count;
        $$
    );

CREATE INDEX idx_bids_created_at ON bids (created_at);

CREATE INDEX idx_company_jobs_job_id ON company_jobs (job_id);

SELECT
    cron.schedule (
        'update-daily-company-reccomended-count',
        '0 4 * * *',
        $$
        WITH reccomended_counts AS (
            SELECT company_id, count(*) AS reccomended_count
            FROM account_company_reccomendation_histories
            WHERE created_at > NOW() - INTERVAL '1 day'
            GROUP BY company_id
        )
        INSERT INTO daily_company_aggregate_analytics (company_id, reccomended_count)
        SELECT company_id, reccomended_count FROM reccomended_counts
        ON CONFLICT (company_id, day_number) DO UPDATE
        SET reccomended_count = EXCLUDED.reccomended_count;
        $$
    );

CREATE INDEX idx_account_company_reccomendation_histories_company_id_created_at ON account_company_reccomendation_histories (company_id, created_at);

SELECT
    cron.schedule (
        'update-daily-company-favourited-count',
        '0 4 * * *',
        $$
        WITH favourited_counts AS (
            SELECT company_id, count(*) AS favourited_count
            FROM account_company_favourites
            WHERE created_at > NOW() - INTERVAL '1 day'
            GROUP BY company_id
        )
        INSERT INTO daily_company_aggregate_analytics (company_id, favourited_count)
        SELECT company_id, favourited_count FROM favourited_counts
        ON CONFLICT (company_id, day_number) DO UPDATE
        SET favourited_count = EXCLUDED.favourited_count;
        $$
    );

CREATE INDEX idx_account_company_favourites_company_id_created_at ON account_company_favourites (company_id, created_at);

SELECT
    cron.schedule (
        'remove-last-year-company-analytics',
        '0 4 1 1 *',
        $$
        DELETE FROM daily_company_aggregate_analytics WHERE created_at < NOW() - INTERVAL '1 year';
        $$
    );

CREATE INDEX idx_daily_company_aggregate_analytics_created_at ON daily_company_aggregate_analytics (created_at);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_daily_company_aggregate_analytics_created_at;

SELECT
    cron.unschedule ('remove-last-year-company-analytics');

DROP INDEX idx_account_company_favourites_company_id_created_at;

SELECT
    cron.unschedule ('update-daily-company-favourited-count');

DROP INDEX idx_account_company_reccomendation_histories_company_id_created_at;

SELECT
    cron.unschedule ('update-daily-company-reccomended-count');

DROP INDEX idx_bids_created_at;

DROP INDEX idx_company_jobs_job_id;

SELECT
    cron.unschedule ('update-daily-company-bids-received-count');

DROP INDEX idx_account_company_view_histories_company_id_created_at;

SELECT
    cron.unschedule ('update-daily-company-view-count');

DROP TRIGGER set_day_number_trigger ON daily_company_aggregate_analytics;

DROP FUNCTION set_day_number ();

DROP TRIGGER sync_daily_company_aggregate_analytics_updated_at ON daily_company_aggregate_analytics;

DROP TABLE daily_company_aggregate_analytics;

-- +goose StatementEnd