-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    contract_bids (
        contract_id UUID NOT NULL REFERENCES contracts (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        bid_id UUID NOT NULL REFERENCES bids (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        PRIMARY KEY (contract_id, bid_id)
    );

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE contract_bids;

-- +goose StatementEnd