-- +goose Up
-- +goose StatementBegin
CREATE INDEX idx_bids_sender_company_id_status ON bids (sender_company_id, status);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_bids_sender_company_id_status;

-- +goose StatementEnd