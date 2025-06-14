-- Seed Default Terminology Values
-- This script populates the default terminology entries in the database

DO $$
BEGIN
  -- First, check if the terminology_defaults table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'terminology_defaults') THEN
    -- Clear out any existing defaults to avoid duplicates
    DELETE FROM terminology_defaults;

    -- Journey terminology
    INSERT INTO terminology_defaults (key, value, description) VALUES
  ('journeyTerms.mainUnit.singular', '"journey"'::jsonb, 'Default journey singular name'),
  ('journeyTerms.mainUnit.plural', '"journeys"'::jsonb, 'Default journey plural name'),
  ('journeyTerms.mainUnit.verb', '"complete"'::jsonb, 'Default verb for journey actions'),
  ('journeyTerms.mainUnit.possessive', '"journey''s"'::jsonb, 'Default possessive form for journey'),
  ('journeyTerms.mainUnit.articleIndefinite', '"a"'::jsonb, 'Default indefinite article for journey'),
  ('journeyTerms.mainUnit.articleDefinite', '"the"'::jsonb, 'Default definite article for journey'),
  
  ('journeyTerms.phaseUnit.singular', '"phase"'::jsonb, 'Default phase singular name'),
  ('journeyTerms.phaseUnit.plural', '"phases"'::jsonb, 'Default phase plural name'),
  ('journeyTerms.phaseUnit.possessive', '"phase''s"'::jsonb, 'Default possessive form for phase'),
  ('journeyTerms.phaseUnit.articleIndefinite', '"a"'::jsonb, 'Default indefinite article for phase'),
  ('journeyTerms.phaseUnit.articleDefinite', '"the"'::jsonb, 'Default definite article for phase'),
  
  ('journeyTerms.stepUnit.singular', '"step"'::jsonb, 'Default step singular name'),
  ('journeyTerms.stepUnit.plural', '"steps"'::jsonb, 'Default step plural name'),
  ('journeyTerms.stepUnit.verb', '"complete"'::jsonb, 'Default verb for step actions'),
  ('journeyTerms.stepUnit.possessive', '"step''s"'::jsonb, 'Default possessive form for step'),
  ('journeyTerms.stepUnit.articleIndefinite', '"a"'::jsonb, 'Default indefinite article for step'),
  ('journeyTerms.stepUnit.articleDefinite', '"the"'::jsonb, 'Default definite article for step'),
  
  ('journeyTerms.progressTerms.notStarted', '"not started"'::jsonb, 'Default label for not started status'),
  ('journeyTerms.progressTerms.inProgress', '"in progress"'::jsonb, 'Default label for in progress status'),
  ('journeyTerms.progressTerms.completed', '"completed"'::jsonb, 'Default label for completed status'),
  ('journeyTerms.progressTerms.skipped', '"skipped"'::jsonb, 'Default label for skipped status'),
  ('journeyTerms.progressTerms.notNeeded', '"not needed"'::jsonb, 'Default label for not needed status');

-- Tool terminology
INSERT INTO terminology_defaults (key, value, description) VALUES
  ('toolTerms.mainUnit.singular', '"tool"'::jsonb, 'Default tool singular name'),
  ('toolTerms.mainUnit.plural', '"tools"'::jsonb, 'Default tool plural name'),
  ('toolTerms.mainUnit.verb', '"use"'::jsonb, 'Default verb for tool actions'),
  ('toolTerms.mainUnit.possessive', '"tool''s"'::jsonb, 'Default possessive form for tool'),
  ('toolTerms.mainUnit.articleIndefinite', '"a"'::jsonb, 'Default indefinite article for tool'),
  ('toolTerms.mainUnit.articleDefinite', '"the"'::jsonb, 'Default definite article for tool'),
  
  ('toolTerms.evaluationTerms.singular', '"evaluation"'::jsonb, 'Default evaluation singular name'),
  ('toolTerms.evaluationTerms.plural', '"evaluations"'::jsonb, 'Default evaluation plural name'),
  ('toolTerms.evaluationTerms.verb', '"evaluate"'::jsonb, 'Default verb for evaluation actions'),
  ('toolTerms.evaluationTerms.possessive', '"evaluation''s"'::jsonb, 'Default possessive form for evaluation'),
  ('toolTerms.evaluationTerms.articleIndefinite', '"an"'::jsonb, 'Default indefinite article for evaluation'),
  ('toolTerms.evaluationTerms.articleDefinite', '"the"'::jsonb, 'Default definite article for evaluation');

-- System terminology
INSERT INTO terminology_defaults (key, value, description) VALUES
  ('systemTerms.application.name', '"The Wheel"'::jsonb, 'Application name'),
  ('systemTerms.application.shortName', '"Wheel"'::jsonb, 'Short application name'),
  ('systemTerms.application.tagline', '"Guiding your startup journey"'::jsonb, 'Application tagline'),
  
  ('systemTerms.actions.save', '"Save"'::jsonb, 'Save action label'),
  ('systemTerms.actions.cancel', '"Cancel"'::jsonb, 'Cancel action label'),
  ('systemTerms.actions.edit', '"Edit"'::jsonb, 'Edit action label'),
  ('systemTerms.actions.delete', '"Delete"'::jsonb, 'Delete action label'),
  ('systemTerms.actions.add', '"Add"'::jsonb, 'Add action label'),
  ('systemTerms.actions.submit', '"Submit"'::jsonb, 'Submit action label'),
  ('systemTerms.actions.back', '"Back"'::jsonb, 'Back action label'),
  ('systemTerms.actions.next', '"Next"'::jsonb, 'Next action label'),
  ('systemTerms.actions.finish', '"Finish"'::jsonb, 'Finish action label');
  ELSE
    RAISE NOTICE 'terminology_defaults table does not exist yet, skipping insertions';
  END IF;
END;
$$;
