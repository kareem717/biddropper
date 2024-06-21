-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    media_relationships (
        media_id UUID PRIMARY KEY REFERENCES media ON UPDATE CASCADE ON DELETE RESTRICT,
        job_id UUID REFERENCES jobs ON UPDATE CASCADE ON DELETE RESTRICT,
        project_id UUID REFERENCES projects ON UPDATE CASCADE ON DELETE RESTRICT,
        review_id UUID REFERENCES reviews ON UPDATE CASCADE ON DELETE RESTRICT,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_media_relationships_updated_at BEFORE
UPDATE ON media_relationships FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_media_relationships_updated_at ON media_relationships;

DROP TABLE media_relationships;

-- +goose StatementEnd