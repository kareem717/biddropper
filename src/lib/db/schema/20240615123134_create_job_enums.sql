-- +goose Up
-- +goose StatementBegin
CREATE TYPE start_date_flag AS ENUM('urgent', 'flexible', 'none');

CREATE TYPE enum_jobs_property_type AS ENUM('detached', 'apartment', 'semi-detached');

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TYPE start_date_flag,
enum_jobs_property_type;

-- +goose StatementEnd