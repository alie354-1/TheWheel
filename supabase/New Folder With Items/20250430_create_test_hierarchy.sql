-- Create Test Hierarchy
-- This script creates a test hierarchy to demonstrate terminology inheritance

DO $$
DECLARE
  v_partner_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID;
  v_org_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID;
  v_company_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID;
  v_team_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID;
  v_user_id UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID;
BEGIN
  -- Create test partner
  IF NOT EXISTS (SELECT 1 FROM partners WHERE id = v_partner_id) THEN
    INSERT INTO partners (
      id, name, slug, status, primary_color, secondary_color
    ) VALUES (
      v_partner_id, 
      'Partner Level', 
      'test-partner-a',
      'active',
      '#4F46E5',
      '#10B981'
    );
  END IF;

  -- Create test organization
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = v_org_id) THEN
    INSERT INTO organizations (
      id, name, partner_id, status
    ) VALUES (
      v_org_id, 
      'Organization Level', 
      v_partner_id,
      'active'
    );
  END IF;

  -- Create test company
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = v_company_id) THEN
    INSERT INTO companies (
      id, name, organization_id, status
    ) VALUES (
      v_company_id, 
      'Company Level', 
      v_org_id,
      'active'
    );
  END IF;

  -- Create test team
  IF NOT EXISTS (SELECT 1 FROM teams WHERE id = v_team_id) THEN
    INSERT INTO teams (
      id, name, company_id, status
    ) VALUES (
      v_team_id, 
      'Team Level', 
      v_company_id,
      'active'
    );
  END IF;

  -- Create test user (if users table exists)
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id) THEN
      INSERT INTO users (
        id, name, email, status
      ) VALUES (
        v_user_id, 
        'User Level', 
        'test.user@example.com',
        'active'
      );
    END IF;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Users table not found, skipping user creation';
  END;
  
  -- Create relationships between entities
  
  -- Add user to company (if relevant tables exist)
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM company_members WHERE user_id = v_user_id AND company_id = v_company_id) THEN
      INSERT INTO company_members (
        user_id, company_id, role, status
      ) VALUES (
        v_user_id,
        v_company_id,
        'member',
        'active'
      );
    END IF;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'company_members table not found, skipping relationship';
  END;
  
  -- Add user to team (if relevant tables exist)
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM team_members WHERE user_id = v_user_id AND team_id = v_team_id) THEN
      INSERT INTO team_members (
        user_id, team_id, role, status
      ) VALUES (
        v_user_id,
        v_team_id,
        'member',
        'active'
      );
    END IF;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'team_members table not found, skipping relationship';
  END;

  -- Clear existing terminology for these test entities
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partner_terminology') THEN
    DELETE FROM partner_terminology WHERE partner_id = v_partner_id;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_terminology') THEN
    DELETE FROM organization_terminology WHERE organization_id = v_org_id;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_terminology') THEN
    DELETE FROM company_terminology WHERE company_id = v_company_id;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_terminology') THEN
    DELETE FROM team_terminology WHERE team_id = v_team_id;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_terminology_preferences') THEN
    DELETE FROM user_terminology_preferences WHERE user_id = v_user_id;
  END IF;

  -- Insert terminology overrides at each level to show inheritance
  -- Partner level terminology
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partner_terminology') THEN
    INSERT INTO partner_terminology (key, value, override_behavior, partner_id) VALUES
      -- Journey terminology
      ('journeyTerms.mainUnit.singular', '"roadmap"'::jsonb, 'replace', v_partner_id),
      ('journeyTerms.mainUnit.plural', '"roadmaps"'::jsonb, 'replace', v_partner_id),
      -- System terminology
      ('systemTerms.application.name', '"Partner App"'::jsonb, 'replace', v_partner_id),
      ('systemTerms.application.tagline', '"Partner-branded solution"'::jsonb, 'replace', v_partner_id);
  ELSE
    RAISE NOTICE 'partner_terminology table does not exist yet, skipping insertions';
  END IF;

  -- Organization level terminology
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_terminology') THEN
    INSERT INTO organization_terminology (key, value, override_behavior, organization_id) VALUES
      -- Journey terminology 
      ('journeyTerms.phaseUnit.singular', '"segment"'::jsonb, 'replace', v_org_id),
      ('journeyTerms.phaseUnit.plural', '"segments"'::jsonb, 'replace', v_org_id);
  ELSE
    RAISE NOTICE 'organization_terminology table does not exist yet, skipping insertions';
  END IF;

  -- Company level terminology
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_terminology') THEN
    INSERT INTO company_terminology (key, value, override_behavior, company_id) VALUES
      -- Journey terminology
      ('journeyTerms.stepUnit.singular', '"activity"'::jsonb, 'replace', v_company_id),
      ('journeyTerms.stepUnit.plural', '"activities"'::jsonb, 'replace', v_company_id),
      ('journeyTerms.progressTerms.completed', '"accomplished"'::jsonb, 'replace', v_company_id);
  ELSE
    RAISE NOTICE 'company_terminology table does not exist yet, skipping insertions';
  END IF;

  -- Team level terminology
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_terminology') THEN
    INSERT INTO team_terminology (key, value, override_behavior, team_id) VALUES
      -- Tool terminology
      ('toolTerms.mainUnit.singular', '"utility"'::jsonb, 'replace', v_team_id),
      ('toolTerms.mainUnit.plural', '"utilities"'::jsonb, 'replace', v_team_id);
  ELSE
    RAISE NOTICE 'team_terminology table does not exist yet, skipping insertions';
  END IF;

  -- User level terminology
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_terminology_preferences') THEN
    INSERT INTO user_terminology_preferences (key, value, user_id) VALUES
      -- System terminology actions
      ('systemTerms.actions.save', '"Keep"'::jsonb, v_user_id),
      ('systemTerms.actions.cancel', '"Nevermind"'::jsonb, v_user_id);
  ELSE
    RAISE NOTICE 'user_terminology_preferences table does not exist yet, skipping insertions';
  END IF;

  -- Output success message
  RAISE NOTICE 'Test hierarchy created with terminology at each level:';
  RAISE NOTICE '- Partner: %', v_partner_id;
  RAISE NOTICE '- Organization: %', v_org_id;
  RAISE NOTICE '- Company: %', v_company_id;
  RAISE NOTICE '- Team: %', v_team_id;
  RAISE NOTICE '- User: %', v_user_id;
END;
$$;
