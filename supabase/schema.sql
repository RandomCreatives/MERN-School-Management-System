-- BIS NOC School Management System - Supabase Schema
-- Safe migration: handles both fresh install and existing tables
-- Run in: https://supabase.com/dashboard/project/mecwutiriiugydniirgg/sql/new

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ADMINS
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    school_name TEXT UNIQUE NOT NULL,
    role        TEXT DEFAULT 'Admin',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCLASSES
-- ============================================
CREATE TABLE IF NOT EXISTS sclasses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sclass_name TEXT NOT NULL,
    school_id   UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sclass_name, school_id)
);

-- ============================================
-- SUBJECTS (no teacher_id FK yet — added after teachers)
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_name   TEXT NOT NULL,
    sub_code   TEXT NOT NULL,
    sessions   TEXT NOT NULL,
    sclass_id  UUID REFERENCES sclasses(id) ON DELETE CASCADE,
    school_id  UUID REFERENCES admins(id) ON DELETE CASCADE,
    teacher_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='teacher_id') THEN
    ALTER TABLE subjects ADD COLUMN teacher_id UUID;
  END IF;
END $$;

-- ============================================
-- TEACHERS
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name               TEXT NOT NULL,
    email              TEXT UNIQUE NOT NULL,
    teacher_id         TEXT UNIQUE,
    password           TEXT NOT NULL,
    role               TEXT DEFAULT 'Teacher',
    teacher_type       TEXT CHECK (teacher_type IN ('main_teacher','subject_teacher','assistant_teacher','special_needs_teacher')) NOT NULL,
    school_id          UUID REFERENCES admins(id) ON DELETE CASCADE,
    homeroom_class_id  UUID REFERENCES sclasses(id) ON DELETE SET NULL,
    primary_subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    teach_subject_id   UUID REFERENCES subjects(id) ON DELETE SET NULL,
    teach_sclass_id    UUID REFERENCES sclasses(id) ON DELETE SET NULL,
    specialization     TEXT,
    attendance         JSONB DEFAULT '[]',
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to teachers if upgrading
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='homeroom_class_id') THEN
    ALTER TABLE teachers ADD COLUMN homeroom_class_id UUID REFERENCES sclasses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='primary_subject_id') THEN
    ALTER TABLE teachers ADD COLUMN primary_subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='teach_subject_id') THEN
    ALTER TABLE teachers ADD COLUMN teach_subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='teach_sclass_id') THEN
    ALTER TABLE teachers ADD COLUMN teach_sclass_id UUID REFERENCES sclasses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='specialization') THEN
    ALTER TABLE teachers ADD COLUMN specialization TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teachers' AND column_name='attendance') THEN
    ALTER TABLE teachers ADD COLUMN attendance JSONB DEFAULT '[]';
  END IF;
END $$;

-- Add teacher FK to subjects
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_subjects_teacher' AND table_name='subjects') THEN
    ALTER TABLE subjects ADD CONSTRAINT fk_subjects_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- STUDENTS
-- ============================================
CREATE TABLE IF NOT EXISTS students (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id       TEXT UNIQUE,
    name             TEXT NOT NULL,
    roll_num         INTEGER NOT NULL,
    password         TEXT NOT NULL,
    sclass_id        UUID REFERENCES sclasses(id) ON DELETE SET NULL,
    school_id        UUID REFERENCES admins(id) ON DELETE CASCADE,
    role             TEXT DEFAULT 'Student',
    parent_contact   JSONB DEFAULT '{}',
    special_needs    JSONB DEFAULT '{"hasSpecialNeeds": false, "category": "none"}',
    transfer_history JSONB DEFAULT '[]',
    exam_result      JSONB DEFAULT '[]',
    attendance       JSONB DEFAULT '[]',
    active           BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='sclass_id') THEN
    ALTER TABLE students ADD COLUMN sclass_id UUID REFERENCES sclasses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='parent_contact') THEN
    ALTER TABLE students ADD COLUMN parent_contact JSONB DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='special_needs') THEN
    ALTER TABLE students ADD COLUMN special_needs JSONB DEFAULT '{"hasSpecialNeeds": false, "category": "none"}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='transfer_history') THEN
    ALTER TABLE students ADD COLUMN transfer_history JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='exam_result') THEN
    ALTER TABLE students ADD COLUMN exam_result JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='attendance') THEN
    ALTER TABLE students ADD COLUMN attendance JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='active') THEN
    ALTER TABLE students ADD COLUMN active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username          TEXT UNIQUE NOT NULL,
    email             TEXT UNIQUE NOT NULL,
    password          TEXT NOT NULL,
    role              TEXT CHECK (role IN ('admin','main_teacher','assistant_teacher','subject_teacher')) NOT NULL,
    assigned_classes  JSONB DEFAULT '[]',
    assigned_subjects JSONB DEFAULT '[]',
    is_active         BOOLEAN DEFAULT TRUE,
    last_login        TIMESTAMPTZ,
    school_id         UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
    ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login') THEN
    ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='school_id') THEN
    ALTER TABLE users ADD COLUMN school_id UUID REFERENCES admins(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- NOTICES
-- ============================================
CREATE TABLE IF NOT EXISTS notices (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title      TEXT NOT NULL,
    details    TEXT NOT NULL,
    date       DATE NOT NULL,
    school_id  UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPLAINS
-- ============================================
CREATE TABLE IF NOT EXISTS complains (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES students(id) ON DELETE CASCADE,
    date       DATE NOT NULL,
    complaint  TEXT NOT NULL,
    school_id  UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ATTENDANCE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    status          TEXT CHECK (status IN ('P','L','A','AP')) NOT NULL,
    reason          TEXT,
    marked_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    subject_id      UUID REFERENCES subjects(id) ON DELETE SET NULL,
    attendance_type TEXT CHECK (attendance_type IN ('homeroom','subject')) NOT NULL,
    class_id        UUID REFERENCES sclasses(id) ON DELETE CASCADE,
    school_id       UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='class_id') THEN
    ALTER TABLE attendance ADD COLUMN class_id UUID REFERENCES sclasses(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='school_id') THEN
    ALTER TABLE attendance ADD COLUMN school_id UUID REFERENCES admins(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='attendance_type') THEN
    ALTER TABLE attendance ADD COLUMN attendance_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='subject_id') THEN
    ALTER TABLE attendance ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='marked_by') THEN
    ALTER TABLE attendance ADD COLUMN marked_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date   ON attendance(class_id, date);

-- ============================================
-- MARKSHEETS
-- ============================================
CREATE TABLE IF NOT EXISTS marksheets (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id   UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id   UUID REFERENCES subjects(id) ON DELETE CASCADE,
    term         TEXT CHECK (term IN ('Term 1','Term 2','Term 3','Final')) NOT NULL,
    marks        JSONB DEFAULT '{}',
    total_marks  NUMERIC DEFAULT 0,
    max_marks    NUMERIC DEFAULT 100,
    percentage   NUMERIC DEFAULT 0,
    grade        TEXT,
    entered_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    class_id     UUID REFERENCES sclasses(id) ON DELETE SET NULL,
    school_id    UUID REFERENCES admins(id) ON DELETE CASCADE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, subject_id, term)
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marksheets' AND column_name='class_id') THEN
    ALTER TABLE marksheets ADD COLUMN class_id UUID REFERENCES sclasses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marksheets' AND column_name='school_id') THEN
    ALTER TABLE marksheets ADD COLUMN school_id UUID REFERENCES admins(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_marksheets_class_term ON marksheets(class_id, term);

-- ============================================
-- LIBRARY
-- ============================================
CREATE TABLE IF NOT EXISTS library (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id         UUID REFERENCES students(id) ON DELETE CASCADE,
    book_title         TEXT NOT NULL,
    book_isbn          TEXT,
    book_author        TEXT,
    book_category      TEXT CHECK (book_category IN ('Fiction','Non-Fiction','Science','Mathematics','History','Literature','Reference','Other')),
    borrow_date        TIMESTAMPTZ DEFAULT NOW(),
    due_date           TIMESTAMPTZ NOT NULL,
    return_date        TIMESTAMPTZ,
    status             TEXT CHECK (status IN ('borrowed','returned','overdue','lost')) DEFAULT 'borrowed',
    condition_borrowed TEXT CHECK (condition_borrowed IN ('excellent','good','fair','poor')) DEFAULT 'good',
    condition_returned TEXT CHECK (condition_returned IN ('excellent','good','fair','poor','damaged')),
    fine_amount        NUMERIC DEFAULT 0,
    fine_paid          BOOLEAN DEFAULT FALSE,
    fine_reason        TEXT,
    notes              TEXT,
    issued_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    returned_to        UUID REFERENCES users(id) ON DELETE SET NULL,
    class_id           UUID REFERENCES sclasses(id) ON DELETE SET NULL,
    school_id          UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='library' AND column_name='class_id') THEN
    ALTER TABLE library ADD COLUMN class_id UUID REFERENCES sclasses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='library' AND column_name='school_id') THEN
    ALTER TABLE library ADD COLUMN school_id UUID REFERENCES admins(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='library' AND column_name='fine_amount') THEN
    ALTER TABLE library ADD COLUMN fine_amount NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='library' AND column_name='fine_paid') THEN
    ALTER TABLE library ADD COLUMN fine_paid BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='library' AND column_name='fine_reason') THEN
    ALTER TABLE library ADD COLUMN fine_reason TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_library_student_status ON library(student_id, status);
CREATE INDEX IF NOT EXISTS idx_library_status_due     ON library(status, due_date);

-- ============================================
-- CLINIC
-- ============================================
CREATE TABLE IF NOT EXISTS clinic (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID REFERENCES students(id) ON DELETE CASCADE,
    visit_date          TIMESTAMPTZ DEFAULT NOW(),
    visit_time          TEXT NOT NULL,
    chief_complaint     TEXT NOT NULL,
    incident_type       TEXT CHECK (incident_type IN ('illness','injury','accident','emergency','routine_checkup','medication','first_aid','other')) NOT NULL,
    incident_details    JSONB DEFAULT '{}',
    symptoms            JSONB DEFAULT '[]',
    vital_signs         JSONB DEFAULT '{}',
    diagnosis           TEXT NOT NULL,
    treatment           JSONB DEFAULT '{}',
    outcome             TEXT CHECK (outcome IN ('returned_to_class','sent_home','referred_to_hospital','parent_contacted','observation_required','follow_up_needed')) NOT NULL,
    leave_request       JSONB DEFAULT '{"required": false}',
    parent_notification JSONB DEFAULT '{"notified": false}',
    follow_up           JSONB DEFAULT '{"required": false}',
    attended_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    class_id            UUID REFERENCES sclasses(id) ON DELETE SET NULL,
    school_id           UUID REFERENCES admins(id) ON DELETE CASCADE,
    case_report         TEXT,
    confidential        BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clinic' AND column_name='class_id') THEN
    ALTER TABLE clinic ADD COLUMN class_id UUID REFERENCES sclasses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clinic' AND column_name='school_id') THEN
    ALTER TABLE clinic ADD COLUMN school_id UUID REFERENCES admins(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clinic' AND column_name='confidential') THEN
    ALTER TABLE clinic ADD COLUMN confidential BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clinic_student_date ON clinic(student_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_clinic_school_date  ON clinic(school_id, visit_date);
