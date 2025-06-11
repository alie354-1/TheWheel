-- Community Module Database Migration (Part 2)
-- This file continues the RLS policies for the community module
-- Date: 2025-06-07

-- Create RLS policies for community_events (continued)
DROP POLICY IF EXISTS "Users can create events" ON community_events;
CREATE POLICY "Users can create events" 
ON community_events FOR INSERT 
WITH CHECK (organizer_id = auth.uid());

DROP POLICY IF EXISTS "Event organizers can update their events" ON community_events;
CREATE POLICY "Event organizers can update their events" 
ON community_events FOR UPDATE 
USING (organizer_id = auth.uid() OR auth.uid() = ANY(co_organizers));

-- Create RLS policies for event_registrations
DROP POLICY IF EXISTS "Users can view registrations for events they can see" ON event_registrations;
CREATE POLICY "Users can view registrations for events they can see" 
ON event_registrations FOR SELECT 
USING (
  event_id IN (
    SELECT id FROM community_events WHERE 
    organizer_id = auth.uid() OR 
    auth.uid() = ANY(co_organizers) OR
    (
      target_groups IS NULL OR
      array_length(target_groups, 1) IS NULL OR
      EXISTS (SELECT 1 FROM community_groups WHERE id = ANY(target_groups) AND (access_level = 'public' OR id IN (SELECT group_id FROM group_memberships WHERE user_id = auth.uid() AND status = 'active')))
    )
  )
);

DROP POLICY IF EXISTS "Users can view their own registrations" ON event_registrations;
CREATE POLICY "Users can view their own registrations" 
ON event_registrations FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can register for events" ON event_registrations;
CREATE POLICY "Users can register for events" 
ON event_registrations FOR INSERT 
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own registrations" ON event_registrations;
CREATE POLICY "Users can update their own registrations" 
ON event_registrations FOR UPDATE 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Event organizers can update registrations" ON event_registrations;
CREATE POLICY "Event organizers can update registrations" 
ON event_registrations FOR UPDATE 
USING (event_id IN (SELECT id FROM community_events WHERE organizer_id = auth.uid() OR auth.uid() = ANY(co_organizers)));

-- Create RLS policies for expert_profiles
DROP POLICY IF EXISTS "Expert profiles are viewable by everyone" ON expert_profiles;
CREATE POLICY "Expert profiles are viewable by everyone" 
ON expert_profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can create their own expert profile" ON expert_profiles;
CREATE POLICY "Users can create their own expert profile" 
ON expert_profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own expert profile" ON expert_profiles;
CREATE POLICY "Users can update their own expert profile" 
ON expert_profiles FOR UPDATE 
USING (user_id = auth.uid());

-- Create RLS policies for expert_endorsements
DROP POLICY IF EXISTS "Expert endorsements are viewable by everyone" ON expert_endorsements;
CREATE POLICY "Expert endorsements are viewable by everyone" 
ON expert_endorsements FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can create endorsements" ON expert_endorsements;
CREATE POLICY "Users can create endorsements" 
ON expert_endorsements FOR INSERT 
WITH CHECK (endorser_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own endorsements" ON expert_endorsements;
CREATE POLICY "Users can update their own endorsements" 
ON expert_endorsements FOR UPDATE 
USING (endorser_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own endorsements" ON expert_endorsements;
CREATE POLICY "Users can delete their own endorsements" 
ON expert_endorsements FOR DELETE 
USING (endorser_id = auth.uid());

-- Create RLS policies for achievements
DROP POLICY IF EXISTS "Public achievements are viewable by everyone" ON achievements;
CREATE POLICY "Public achievements are viewable by everyone" 
ON achievements FOR SELECT 
USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own achievements" ON achievements;
CREATE POLICY "Users can view their own achievements" 
ON achievements FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update visibility of their achievements" ON achievements;
CREATE POLICY "Users can update visibility of their achievements" 
ON achievements FOR UPDATE 
USING (user_id = auth.uid());

-- Create RLS policies for contribution_scores
DROP POLICY IF EXISTS "Users can view their own contribution scores" ON contribution_scores;
CREATE POLICY "Users can view their own contribution scores" 
ON contribution_scores FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all contribution scores" ON contribution_scores;
CREATE POLICY "Admins can view all contribution scores" 
ON contribution_scores FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM group_memberships WHERE role = 'admin'));

-- Create RLS policies for recommendation_interactions
DROP POLICY IF EXISTS "Users can view their own recommendation interactions" ON recommendation_interactions;
CREATE POLICY "Users can view their own recommendation interactions" 
ON recommendation_interactions FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own recommendation interactions" ON recommendation_interactions;
CREATE POLICY "Users can create their own recommendation interactions" 
ON recommendation_interactions FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create a default community group for all users
INSERT INTO community_groups (
  name,
  slug,
  description,
  group_type,
  access_level,
  requires_approval,
  is_archived
) VALUES (
  'The Wheel Community',
  'the-wheel-community',
  'The main community group for all users of The Wheel platform',
  'functional_guild',
  'public',
  false,
  false
) ON CONFLICT (slug) DO NOTHING;

-- Add a function to automatically join users to the default community group
CREATE OR REPLACE FUNCTION auto_join_default_community()
RETURNS TRIGGER AS $$
DECLARE
  default_group_id UUID;
BEGIN
  -- Get the default community group ID
  SELECT id INTO default_group_id
  FROM community_groups
  WHERE slug = 'the-wheel-community';
  
  -- If default group exists, add the new user to it
  IF default_group_id IS NOT NULL THEN
    INSERT INTO group_memberships (
      group_id,
      user_id,
      role,
      status
    ) VALUES (
      default_group_id,
      NEW.id,
      'member',
      'active'
    ) ON CONFLICT (group_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-join new users to default community
DROP TRIGGER IF EXISTS auto_join_community_trigger ON auth.users;
CREATE TRIGGER auto_join_community_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auto_join_default_community();

-- Create a function to update the last_activity_at timestamp for group memberships
CREATE OR REPLACE FUNCTION update_group_membership_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the last_active_at timestamp for the user's membership in the group
  UPDATE group_memberships
  SET last_active_at = NOW()
  WHERE user_id = NEW.author_id
    AND group_id = (
      SELECT group_id
      FROM discussion_threads
      WHERE id = NEW.thread_id
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update group membership activity when a user replies to a thread
DROP TRIGGER IF EXISTS update_group_activity_trigger ON thread_replies;
CREATE TRIGGER update_group_activity_trigger
AFTER INSERT ON thread_replies
FOR EACH ROW
EXECUTE FUNCTION update_group_membership_activity();

-- Create a function to update the last_activity_at timestamp for discussion threads
CREATE OR REPLACE FUNCTION update_thread_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the last_activity_at timestamp and last_reply_id for the thread
  UPDATE discussion_threads
  SET last_activity_at = NOW(),
      last_reply_id = NEW.id
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update thread last activity when a new reply is added
DROP TRIGGER IF EXISTS update_thread_activity_trigger ON thread_replies;
CREATE TRIGGER update_thread_activity_trigger
AFTER INSERT ON thread_replies
FOR EACH ROW
EXECUTE FUNCTION update_thread_last_activity();

-- Create a function to automatically calculate total score in contribution_scores
CREATE OR REPLACE FUNCTION calculate_total_contribution_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_score := NEW.knowledge_sharing_points + NEW.introduction_credits + NEW.mentorship_impact_score + NEW.community_building_score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate total contribution score
DROP TRIGGER IF EXISTS calculate_total_score_trigger ON contribution_scores;
CREATE TRIGGER calculate_total_score_trigger
BEFORE INSERT OR UPDATE ON contribution_scores
FOR EACH ROW
EXECUTE FUNCTION calculate_total_contribution_score();

-- Create a function to update the updated_at timestamp for all community tables
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update the updated_at timestamp
DROP TRIGGER IF EXISTS update_community_groups_timestamp ON community_groups;
CREATE TRIGGER update_community_groups_timestamp
BEFORE UPDATE ON community_groups
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

DROP TRIGGER IF EXISTS update_discussion_threads_timestamp ON discussion_threads;
CREATE TRIGGER update_discussion_threads_timestamp
BEFORE UPDATE ON discussion_threads
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

DROP TRIGGER IF EXISTS update_thread_replies_timestamp ON thread_replies;
CREATE TRIGGER update_thread_replies_timestamp
BEFORE UPDATE ON thread_replies
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

DROP TRIGGER IF EXISTS update_community_events_timestamp ON community_events;
CREATE TRIGGER update_community_events_timestamp
BEFORE UPDATE ON community_events
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

DROP TRIGGER IF EXISTS update_expert_profiles_timestamp ON expert_profiles;
CREATE TRIGGER update_expert_profiles_timestamp
BEFORE UPDATE ON expert_profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT ALL ON TABLE community_groups TO authenticated;
GRANT ALL ON TABLE group_memberships TO authenticated;
GRANT ALL ON TABLE discussion_threads TO authenticated;
GRANT ALL ON TABLE thread_replies TO authenticated;
GRANT ALL ON TABLE content_reactions TO authenticated;
GRANT ALL ON TABLE expert_responses TO authenticated;
GRANT ALL ON TABLE community_events TO authenticated;
GRANT ALL ON TABLE event_registrations TO authenticated;
GRANT ALL ON TABLE expert_profiles TO authenticated;
GRANT ALL ON TABLE expert_endorsements TO authenticated;
GRANT ALL ON TABLE achievements TO authenticated;
GRANT ALL ON TABLE contribution_scores TO authenticated;
GRANT ALL ON TABLE recommendation_interactions TO authenticated;

GRANT SELECT ON TABLE community_groups TO anon;
GRANT SELECT ON TABLE discussion_threads TO anon;
GRANT SELECT ON TABLE thread_replies TO anon;
GRANT SELECT ON TABLE community_events TO anon;
GRANT SELECT ON TABLE expert_profiles TO anon;
GRANT SELECT ON TABLE expert_endorsements TO anon;
GRANT SELECT ON TABLE achievements TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION increment_reply_count TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_reply_count TO authenticated;
GRANT EXECUTE ON FUNCTION update_unique_participants TO authenticated;
GRANT EXECUTE ON FUNCTION increment_reaction_count TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_reaction_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_expert_endorsement_counts TO authenticated;
GRANT EXECUTE ON FUNCTION get_expertise_area_counts TO authenticated;
GRANT EXECUTE ON FUNCTION auto_join_default_community TO authenticated;
GRANT EXECUTE ON FUNCTION update_group_membership_activity TO authenticated;
GRANT EXECUTE ON FUNCTION update_thread_last_activity TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_total_contribution_score TO authenticated;
GRANT EXECUTE ON FUNCTION update_modified_timestamp TO authenticated;
