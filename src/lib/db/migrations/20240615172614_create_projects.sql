-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        company_id UUID NOT NULL REFERENCES companies (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_projects_updated_at BEFORE
UPDATE ON projects FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_projects_updated_at ON projects;

DROP TABLE projects;

-- +goose StatementEnd