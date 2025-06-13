ALTER TABLE comments
ADD COLUMN edit_history JSONB[] DEFAULT '{}'::JSONB[];

CREATE OR REPLACE FUNCTION record_comment_edit()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.text_content IS DISTINCT FROM NEW.text_content OR OLD.feedback_category IS DISTINCT FROM NEW.feedback_category THEN
    NEW.edit_history = array_append(
      OLD.edit_history,
      jsonb_build_object(
        'textContent', OLD.text_content,
        'feedback_category', OLD.feedback_category,
        'edited_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_comment_update
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION record_comment_edit();
