-- +goose Up
-- +goose StatementBegin
ALTER TABLE companies
ADD COLUMN image_id UUID REFERENCES media (id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
ALTER TABLE companies
DROP COLUMN image_id;

-- +goose StatementEnd

