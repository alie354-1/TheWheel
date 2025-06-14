-- Create the recommendation_models table
CREATE TABLE IF NOT EXISTS recommendation_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    algorithm VARCHAR(255) NOT NULL,
    config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the recommendation_feedback table
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    recommendation_type VARCHAR(255) NOT NULL,
    recommendation_id INT NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the user_behavior_analytics table
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    event_type VARCHAR(255) NOT NULL,
    recommendation_type VARCHAR(255),
    recommendation_id INT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE recommendation_feedback
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id)
REFERENCES auth.users(id);

ALTER TABLE user_behavior_analytics
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id)
REFERENCES auth.users(id);
