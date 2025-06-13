-- Seed Alternative Terminology Templates
-- This script creates terminology templates for different business contexts

-- Create a demo partner and populate terminology
DO $$
DECLARE
  v_partner_id UUID := '11111111-1111-1111-1111-111111111111'::UUID;
  partner_exists boolean;
BEGIN
  -- Check if partner already exists
  SELECT EXISTS(SELECT 1 FROM partners WHERE id = v_partner_id) INTO partner_exists;
  
  IF NOT partner_exists THEN
    INSERT INTO partners (
      id, name, slug, primary_color, secondary_color, status
    ) VALUES (
      v_partner_id, 
      'Terminology Templates Demo', 
      'terminology-templates',
      '#4F46E5',
      '#10B981',
      'active'
    );
  END IF;

  -- Remember the partner ID for later use
  RAISE NOTICE 'Using partner_id: %', v_partner_id;
  
  -- Clear existing templates from this partner to avoid duplicates
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partner_terminology') THEN
    DELETE FROM partner_terminology WHERE partner_id = v_partner_id;
    
    -- Business Formal terminology set
    -- Formal, enterprise-oriented terminology suitable for corporate environments
    INSERT INTO partner_terminology (key, value, override_behavior, partner_id) VALUES
      -- Journey terminology
      ('journeyTerms.mainUnit.singular', '"objective"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.mainUnit.plural', '"objectives"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.mainUnit.verb', '"achieve"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.mainUnit.possessive', '"objective''s"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.mainUnit.articleIndefinite', '"an"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.mainUnit.articleDefinite', '"the"'::jsonb, 'replace', v_partner_id),
      
      ('journeyTerms.phaseUnit.singular', '"milestone"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.phaseUnit.plural', '"milestones"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.phaseUnit.possessive', '"milestone''s"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.phaseUnit.articleIndefinite', '"a"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.phaseUnit.articleDefinite', '"the"'::jsonb, 'replace', v_partner_id),
      
      ('journeyTerms.stepUnit.singular', '"action item"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.stepUnit.plural', '"action items"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.stepUnit.verb', '"complete"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.stepUnit.possessive', '"action item''s"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.stepUnit.articleIndefinite', '"an"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.stepUnit.articleDefinite', '"the"'::jsonb, 'replace', v_partner_id),
      
      ('journeyTerms.progressTerms.notStarted', '"not commenced"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.progressTerms.inProgress', '"in progress"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.progressTerms.completed', '"achieved"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.progressTerms.skipped', '"bypassed"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.progressTerms.notNeeded', '"not applicable"'::jsonb, 'replace', v_partner_id),
      
      -- Tool terminology
      ('toolTerms.mainUnit.singular', '"instrument"'::jsonb, 'replace', v_partner_id),
      ('toolTerms.mainUnit.plural', '"instruments"'::jsonb, 'replace', v_partner_id),
      ('toolTerms.mainUnit.verb', '"utilize"'::jsonb, 'replace', v_partner_id),
      ('toolTerms.mainUnit.possessive', '"instrument''s"'::jsonb, 'replace', v_partner_id),
      ('toolTerms.mainUnit.articleIndefinite', '"an"'::jsonb, 'replace', v_partner_id),
      ('toolTerms.mainUnit.articleDefinite', '"the"'::jsonb, 'replace', v_partner_id),
      
      ('toolTerms.evaluationTerms.singular', '"assessment"'::jsonb, 'replace', v_partner_id),
      ('toolTerms.evaluationTerms.plural', '"assessments"'::jsonb, 'replace', v_partner_id),
      ('toolTerms.evaluationTerms.verb', '"assess"'::jsonb, 'replace', v_partner_id),
      ('toolTerms.evaluationTerms.possessive', '"assessment''s"'::jsonb, 'replace', v_partner_id),
      ('toolTerms.evaluationTerms.articleIndefinite', '"an"'::jsonb, 'replace', v_partner_id),
      ('toolTerms.evaluationTerms.articleDefinite', '"the"'::jsonb, 'replace', v_partner_id),
      
      -- System terminology actions
      ('systemTerms.actions.save', '"Save"'::jsonb, 'replace', v_partner_id),
      ('systemTerms.actions.cancel', '"Cancel"'::jsonb, 'replace', v_partner_id),
      ('systemTerms.actions.edit', '"Edit"'::jsonb, 'replace', v_partner_id),
      ('systemTerms.actions.delete', '"Remove"'::jsonb, 'replace', v_partner_id),
      ('systemTerms.actions.add', '"Add"'::jsonb, 'replace', v_partner_id),
      ('systemTerms.actions.submit', '"Submit"'::jsonb, 'replace', v_partner_id),
      ('systemTerms.actions.back', '"Previous"'::jsonb, 'replace', v_partner_id),
      ('systemTerms.actions.next', '"Next"'::jsonb, 'replace', v_partner_id),
      ('systemTerms.actions.finish', '"Complete"'::jsonb, 'replace', v_partner_id);
  ELSE
    RAISE NOTICE 'partner_terminology table does not exist yet, skipping terminology insertions';
  END IF;

  -- Store template metadata in white_label_configuration
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'white_label_configuration'
  ) THEN
    -- Insert the template data
    INSERT INTO white_label_configuration (
      partner_id, terminology_settings, branding_settings
    )
    VALUES (
      v_partner_id,
      jsonb_build_object(
        'availableTemplates', jsonb_build_array(
          jsonb_build_object(
            'id', 'businessFormal',
            'displayName', 'Business Formal',
            'description', 'Formal, enterprise-oriented terminology suitable for corporate environments'
          ),
          jsonb_build_object(
            'id', 'startupFocused',
            'displayName', 'Startup Focused',
            'description', 'Casual, growth-oriented terminology for startup environments'
          ),
          jsonb_build_object(
            'id', 'projectManagement',
            'displayName', 'Project Management',
            'description', 'Delivery and milestone-focused terminology for project management'
          ),
          jsonb_build_object(
            'id', 'casual',
            'displayName', 'Casual',
            'description', 'Simplified, user-friendly terminology for general use'
          )
        ),
        'defaultTemplate', 'businessFormal'
      ),
      jsonb_build_object(
        'showTemplateSelector', true
      )
    )
    ON CONFLICT (partner_id) 
    DO UPDATE SET 
      terminology_settings = EXCLUDED.terminology_settings,
      branding_settings = EXCLUDED.branding_settings;
  ELSE
    RAISE NOTICE 'white_label_configuration table does not exist yet, skipping template configuration';
  END IF;
END;
$$;

-- Note: This script only inserts the business formal template fully
-- For a complete implementation, the other templates would also be inserted:
-- - Startup Focused
-- - Project Management
-- - Casual
--
-- To keep the migration file concise, only one template is fully populated.
-- If you want to add the other templates with different terminology,
-- you can create additional INSERT statements following the pattern above,
-- or execute multiple migration files.
