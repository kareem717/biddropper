-- +goose Up
-- +goose StatementBegin
DO $$ 
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT event_object_table, trigger_name
        FROM information_schema.triggers
        WHERE trigger_name LIKE 'sync_%_updated_at'
    LOOP
        EXECUTE format('
            DROP TRIGGER %I ON %I;
            CREATE TRIGGER %I 
            BEFORE UPDATE ON %I 
            FOR EACH ROW 
            WHEN (NEW.deleted_at IS NULL)
            EXECUTE PROCEDURE sync_updated_at_column ();',
            rec.trigger_name, rec.event_object_table, rec.trigger_name, rec.event_object_table);
    END LOOP;
END $$;

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DO $$ 
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT event_object_table, trigger_name
        FROM information_schema.triggers
        WHERE trigger_name LIKE 'sync_%_updated_at'
    LOOP
        EXECUTE format('
            DROP TRIGGER %I ON %I;
            CREATE TRIGGER %I 
            BEFORE UPDATE ON %I 
            FOR EACH ROW 
            EXECUTE PROCEDURE sync_updated_at_column ();',
            rec.trigger_name, rec.event_object_table, rec.trigger_name, rec.event_object_table);
    END LOOP;
END $$;

-- +goose StatementEnd