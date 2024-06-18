-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    job_bids (
        job_id UUID NOT NULL REFERENCES jobs (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        bid_id UUID NOT NULL REFERENCES bids (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        PRIMARY KEY (job_id, bid_id)
    );

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE job_bids;

-- +goose StatementEnd