-- +goose Up
-- +goose StatementBegin
DROP TABLE message_thread;

CREATE TABLE
    message_replies (
        message_id UUID REFERENCES messages ON UPDATE CASCADE ON DELETE RESTRICT,
        reply_to UUID REFERENCES messages ON UPDATE CASCADE ON DELETE RESTRICT,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz,
        PRIMARY KEY (message_id, reply_to)
    );

CREATE TRIGGER sync_message_replies_updated_at BEFORE
UPDATE ON message_replies FOR EACH ROW WHEN (NEW.updated_at IS NULL)
EXECUTE FUNCTION sync_updated_at_column ();

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'created_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' ALTER COLUMN created_at SET DATA TYPE timestamptz, ALTER COLUMN created_at SET DEFAULT clock_timestamp(), ALTER COLUMN created_at SET NOT NULL';
    END LOOP;
END $$;

CREATE
OR REPLACE FUNCTION sync_updated_at_column () RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CLOCK_TIMESTAMP();
    RETURN NEW;
END;
$$;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
CREATE
OR REPLACE FUNCTION sync_updated_at_column () RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TABLE message_replies;

CREATE TABLE
    message_thread (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        message_id UUID REFERENCES messages ON UPDATE CASCADE ON DELETE RESTRICT,
        created_at timestamptz NOT NULL DEFAULT CLOCK_TIMESTAMP(),
        updated_at timestamptz,
        deleted_at timestamptz
    );

CREATE TRIGGER sync_message_thread_updated_at BEFORE
UPDATE ON message_thread FOR EACH ROW WHEN (NEW.updated_at IS NULL)
EXECUTE FUNCTION sync_updated_at_column ();

-- +goose StatementEnd