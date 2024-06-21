-- +goose Up
-- +goose StatementBegin
CREATE TABLE
    job_media (
        media_id UUID NOT NULL REFERENCES media ON UPDATE CASCADE ON DELETE RESTRICT,
        job_id UUID NOT NULL REFERENCES jobs ON UPDATE CASCADE ON DELETE RESTRICT,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz,
        PRIMARY KEY (media_id, job_id)
    );

CREATE TABLE
    project_media (
        media_id UUID NOT NULL REFERENCES media ON UPDATE CASCADE ON DELETE RESTRICT,
        project_id UUID NOT NULL REFERENCES projects ON UPDATE CASCADE ON DELETE RESTRICT,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz,
        PRIMARY KEY (media_id, project_id)
    );

CREATE TABLE
    review_media (
        media_id UUID NOT NULL REFERENCES media ON UPDATE CASCADE ON DELETE RESTRICT,
        review_id UUID NOT NULL REFERENCES reviews ON UPDATE CASCADE ON DELETE RESTRICT,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz,
        PRIMARY KEY (media_id, review_id)
    );

CREATE TRIGGER sync_job_media_updated_at BEFORE
UPDATE ON job_media FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

CREATE TRIGGER sync_project_media_updated_at BEFORE
UPDATE ON project_media FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

CREATE TRIGGER sync_review_media_updated_at BEFORE
UPDATE ON review_media FOR EACH ROW
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TRIGGER sync_job_media_updated_at ON job_media;

DROP TRIGGER sync_project_media_updated_at ON project_media;

DROP TRIGGER sync_review_media_updated_at ON review_media;

DROP TABLE job_media;

DROP TABLE project_media;

DROP TABLE review_media;

-- +goose StatementEnd