-- Create startup_stage enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'startup_stage') THEN
        CREATE TYPE startup_stage AS ENUM (
            'pre_seed',
            'seed',
            'series_a',
            'series_b',
            'series_c_plus',
            'growth',
            'exit'
        );
    END IF;
END$$;
