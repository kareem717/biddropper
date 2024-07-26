-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    daily_job_aggregate_analytics (
        job_id UUID NOT NULL REFERENCES companies,
        day_number INT NOT NULL,
        view_count INT NOT NULL DEFAULT 0,
        bids_recieved_count INT NOT NULL DEFAULT 0,
        favourited_count INT NOT NULL DEFAULT 0,
        reccomended_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CLOCK_TIMESTAMP() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        PRIMARY KEY (job_id, day_number)
    );

CREATE TRIGGER sync_daily_job_aggregate_analytics_updated_at BEFORE
UPDATE ON daily_job_aggregate_analytics FOR EACH ROW
EXECUTE PROCEDURE sync_updated_at_column ();

CREATE TRIGGER set_day_number_trigger BEFORE INSERT ON daily_job_aggregate_analytics FOR EACH ROW
EXECUTE FUNCTION set_day_number ();

SELECT
    cron.schedule (
        'update-daily-job-view-count',
        '0 4 * * *',
        $$
        WITH view_counts AS (
            SELECT job_id, count(*) AS view_count
            FROM account_job_view_histories
            WHERE created_at > NOW() - INTERVAL '1 day'
            GROUP BY job_id
        )
        INSERT INTO daily_job_aggregate_analytics (job_id, view_count)
        SELECT job_id, view_count FROM view_counts
        ON CONFLICT (job_id, day_number) DO UPDATE
        SET view_count = EXCLUDED.view_count;
        $$
    );

CREATE INDEX idx_account_job_view_histories_job_id_created_at ON account_job_view_histories (job_id, created_at);

SELECT
    cron.schedule (
        'update-daily-job-bids-received-count',
        '0 4 * * *',
        $$
        WITH bid_counts AS (
            SELECT cb.job_id, count(*) AS bids_recieved_count
            FROM bids b
            INNER JOIN job_bids jb ON jb.bid_id = b.id
            WHERE b.created_at > NOW() - INTERVAL '1 day'
            GROUP BY cb.job_id
        )
        INSERT INTO daily_job_aggregate_analytics (job_id, bids_recieved_count)
        SELECT job_id, bids_recieved_count FROM bid_counts
        ON CONFLICT (job_id, day_number) DO UPDATE
        SET bids_recieved_count = EXCLUDED.bids_recieved_count;
        $$
    );

CREATE INDEX idx_job_bids_bid_id ON job_bids (bid_id);

SELECT
    cron.schedule (
        'update-daily-job-reccomended-count',
        '0 4 * * *',
        $$
        WITH reccomended_counts AS (
            SELECT job_id, count(*) AS reccomended_count
            FROM account_job_reccomendation_histories
            WHERE created_at > NOW() - INTERVAL '1 day'
            GROUP BY job_id
        )
        INSERT INTO daily_job_aggregate_analytics (job_id, reccomended_count)
        SELECT job_id, reccomended_count FROM reccomended_counts
        ON CONFLICT (job_id, day_number) DO UPDATE
        SET reccomended_count = EXCLUDED.reccomended_count;
        $$
    );

CREATE INDEX idx_account_job_reccomendation_histories_job_id_created_at ON account_job_reccomendation_histories (job_id, created_at);

SELECT
    cron.schedule (
        'update-daily-job-favourited-count',
        '0 4 * * *',
        $$
        WITH favourited_counts AS (
            SELECT job_id, count(*) AS favourited_count
            FROM account_job_favourites
            WHERE created_at > NOW() - INTERVAL '1 day'
            GROUP BY job_id
        )
        INSERT INTO daily_job_aggregate_analytics (job_id, favourited_count)
        SELECT job_id, favourited_count FROM favourited_counts
        ON CONFLICT (job_id, day_number) DO UPDATE
        SET favourited_count = EXCLUDED.favourited_count;
        $$
    );

CREATE INDEX idx_account_job_favourites_job_id_created_at ON account_job_favourites (job_id, created_at);

SELECT
    cron.schedule (
        'remove-last-year-job-analytics',
        '0 4 1 1 *',
        $$
        DELETE FROM daily_job_aggregate_analytics WHERE created_at < NOW() - INTERVAL '1 year';
        $$
    );

CREATE INDEX idx_daily_job_aggregate_analytics_created_at ON daily_job_aggregate_analytics (created_at);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_daily_job_aggregate_analytics_created_at;

SELECT
    cron.unschedule ('remove-last-year-job-analytics');

DROP INDEX idx_account_job_favourites_job_id_created_at;

SELECT
    cron.unschedule ('update-daily-job-favourited-count');

DROP INDEX idx_account_job_reccomendation_histories_job_id_created_at;

SELECT
    cron.unschedule ('update-daily-job-reccomended-count');

DROP INDEX idx_job_bids_bid_id;

SELECT
    cron.unschedule ('update-daily-job-bids-received-count');

DROP INDEX idx_account_job_view_histories_job_id_created_at;

SELECT
    cron.unschedule ('update-daily-job-view-count');

DROP TRIGGER set_day_number_trigger ON daily_job_aggregate_analytics;

DROP TRIGGER sync_daily_job_aggregate_analytics_updated_at ON daily_job_aggregate_analytics;

DROP TABLE daily_job_aggregate_analytics;

-- +goose StatementEnd