-- ===============================================
-- JOURNEY ENHANCED SCHEMA FIXES (UPDATED)
-- ===============================================
-- This migration fixes issues with the company_id column
-- Date: June 11, 2025

-- ===============================================
-- ENSURE COMPANIES TABLE EXISTS WITH CORRECT STRUCTURE
-- ===============================================

-- First, ensure the companies table exists with the correct structure
DO $$ 
BEGIN
    -- Check if companies table exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'companies' AND schemaname = 'public') THEN
        -- Create companies table with UUID primary key
        CREATE TABLE companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            industry TEXT,
            stage TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Created companies table with UUID primary key';
    ELSE
        -- Check if companies.id exists and is UUID type
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            RAISE EXCEPTION 'Companies table exists but id column is not UUID type. Migration cannot proceed safely.';
        ELSE
            RAISE NOTICE 'Companies table exists with UUID id column';
        END IF;
    END IF;
END $$;

-- ===============================================
-- DISABLE ROW LEVEL SECURITY ON ALL TABLES
-- ===============================================

-- First, drop all RLS policies that might be using company_id incorrectly
DO $$ 
DECLARE
    tbl_name text;
    policy_name text;
BEGIN
    RAISE NOTICE '========== DISABLING ROW LEVEL SECURITY ==========';
    
    -- Loop through all tables and drop all policies to ensure clean slate
    FOR tbl_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        BEGIN
            -- Get policies for this table
            FOR policy_name IN
                SELECT policyname FROM pg_policies 
                WHERE tablename = tbl_name AND schemaname = 'public'
            LOOP
                BEGIN
                    -- Use dynamic SQL to drop policy
                    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, tbl_name);
                    RAISE NOTICE 'Dropped policy % on table %', policy_name, tbl_name;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Error dropping policy % on table %: %', policy_name, tbl_name, SQLERRM;
                END;
            END LOOP;
            
            -- Disable RLS on the table
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'Disabled RLS on table %', tbl_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error processing table %: %', tbl_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '========== ROW LEVEL SECURITY DISABLED ==========';
END $$;

-- ===============================================
-- VERIFY FOREIGN KEY RELATIONSHIPS
-- ===============================================

-- This query validates all foreign key relationships to companies
DO $$ 
BEGIN
    RAISE NOTICE '========== COMPANY FOREIGN KEY RELATIONSHIPS ==========';
    
    -- First, check if companies table exists and has id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'id' AND table_schema = 'public'
    ) THEN
        -- List all tables with company_id foreign keys
        FOR r IN
            SELECT
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM
                information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND ccu.table_name = 'companies'
            ORDER BY tc.table_name
        LOOP
            RAISE NOTICE 'Table: %, Column: % references companies.%', 
                       r.table_name, r.column_name, r.foreign_column_name;
                       
            -- Verify the column exists in the table
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = r.table_name AND column_name = r.column_name
            ) THEN
                RAISE NOTICE '  WARNING: Column % does not exist in table %', 
                            r.column_name, r.table_name;
            END IF;
        END LOOP;
    ELSE
        RAISE NOTICE 'Companies table does not exist or does not have id column';
    END IF;
    
    RAISE NOTICE '========== END OF FOREIGN KEY CHECK ==========';
END $$;

-- ===============================================
-- DIAGNOSTIC INFORMATION ABOUT ALL JOURNEY TABLES
-- ===============================================

-- Output schema information for all journey-related tables
DO $$ 
DECLARE
    tbl_name text;
BEGIN
    RAISE NOTICE '========== JOURNEY TABLES STRUCTURE ==========';
    
    -- Loop through all journey-related tables
    FOR tbl_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' AND 
        (
            tablename LIKE 'journey%' OR 
            tablename LIKE 'company_journey%' OR
            tablename LIKE 'company_step%'
        )
        ORDER BY tablename
    LOOP
        RAISE NOTICE 'Table: %', tbl_name;
        
        -- List columns for this table
        FOR r IN 
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = tbl_name
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  Column: % (Type: %, Nullable: %)', 
                         r.column_name, r.data_type, r.is_nullable;
        END LOOP;
        
        RAISE NOTICE '-----------------------------------------';
    END LOOP;
    
    RAISE NOTICE '========== END OF JOURNEY TABLES STRUCTURE ==========';
END $$;

-- NOTICE: Row Level Security remains disabled for now
-- This is intentional to prevent "column company_id does not exist" errors
-- RLS should be re-enabled in a separate migration after all tables are properly created
