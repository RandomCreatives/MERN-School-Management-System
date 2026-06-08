-- STEP 1: Run this first to drop all existing tables
-- https://supabase.com/dashboard/project/mecwutiriiugydniirgg/sql/new

DROP TABLE IF EXISTS clinic       CASCADE;
DROP TABLE IF EXISTS library      CASCADE;
DROP TABLE IF EXISTS marksheets   CASCADE;
DROP TABLE IF EXISTS attendance   CASCADE;
DROP TABLE IF EXISTS complains    CASCADE;
DROP TABLE IF EXISTS notices      CASCADE;
DROP TABLE IF EXISTS users        CASCADE;
DROP TABLE IF EXISTS students     CASCADE;
DROP TABLE IF EXISTS teachers     CASCADE;
DROP TABLE IF EXISTS subjects     CASCADE;
DROP TABLE IF EXISTS sclasses     CASCADE;
DROP TABLE IF EXISTS admins       CASCADE;
