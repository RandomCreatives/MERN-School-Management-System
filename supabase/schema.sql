-- BIS NOC School Management System - Supabase Schema
-- PostgreSQL schema for all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    school_name TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLASSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sclasses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sclass_name TEXT NOT NULL,
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sclass_name, school_id)
);

-- ============================================
-- SUBJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_name TEXT NOT NULL,
    sub_code TEXT NOT NULL,
    sessions TEXT NOT NULL,
    sclass_id UUID REFERENCES sclasses(id) ON DELETE CASCADE,
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    teacher_id UUID,  -- Will reference teachers after that table is created
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEACHERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    teacher_id TEXT UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'Teacher',
    teacher_type TEXT CHECK (teacher_type IN ('main_teacher', 'subject_teacher', 'assistant_teacher', 'special_needs_teacher')) NOT NULL,
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    homeroom_class_id UUID REFERENCES sclasses(id),
    primary_subject_id UUID REFERENCES subjects(id),
    teach_subject_id UUID REFERENCES subjects(id),
    teach_sclass_id UUID REFERENCES sclasses(id),
    specialization TEXT,
    attendance JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add teacher foreign key to subjects
ALTER TABLE subjects ADD CONSTRAINT fk_subjects_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT UNIQUE,
    name TEXT NOT NULL,
    roll_num INTEGER NOT NULL,
    password TEXT NOT NULL,
    sclass_id UUID REFERENCES sclasses(id) ON DELETE SET NULL,
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'Student',
    parent_contact JSONB DEFAULT '{}',
    special_needs JSONB DEFAULT '{"hasSpecialNeeds": false, "category": "none"}',
    transfer_history JSONB DEFAULT '[]',
    exam_result JSONB DEFAULT '[]',
    attendance JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS TABLE (Staff/Teachers with roles)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'main_teacher', 'assistant_teacher', 'subject_teacher')) NOT NULL,
    assigned_classes JSONB DEFAULT '[]',
    assigned_subjects JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    date DATE NOT NULL,
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPLAINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS complains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    complaint TEXT NOT NULL,
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('P', 'L', 'A', 'AP')) NOT NULL,
    reason TEXT,
    marked_by UUID REFERENCES users(id),
    subject_id UUID REFERENCES subjects(id),
    attendance_type TEXT CHECK (attendance_type IN ('homeroom', 'subject')) NOT NULL,
    class_id UUID REFERENCES sclasses(id) ON DELETE CASCADE,
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(class_id, date);

-- ============================================
-- MARKSHEETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS marksheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    term TEXT CHECK (term IN ('Term 1', 'Term 2', 'Term 3', 'Final')) NOT NULL,
    marks JSONB DEFAULT '{}',
    total_marks NUMERIC DEFAULT 0,
    max_marks NUMERIC DEFAULT 100,
    percentage NUMERIC DEFAULT 0,
    grade TEXT,
    entered_by UUID REFERENCES users(id),
    class_id UUID REFERENCES sclasses(id),
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, subject_id, term)
);

CREATE INDEX IF NOT EXISTS idx_marksheets_class_term ON marksheets(class_id, term);

-- ============================================
-- LIBRARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    book_title TEXT NOT NULL,
    book_isbn TEXT,
    book_author TEXT,
    book_category TEXT CHECK (book_category IN ('Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History', 'Literature', 'Reference', 'Other')),
    borrow_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ,
    status TEXT CHECK (status IN ('borrowed', 'returned', 'overdue', 'lost')) DEFAULT 'borrowed',
    condition_borrowed TEXT CHECK (condition_borrowed IN ('excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
    condition_returned TEXT CHECK (condition_returned IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
    fine_amount NUMERIC DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    fine_reason TEXT,
    notes TEXT,
    issued_by UUID REFERENCES users(id),
    returned_to UUID REFERENCES users(id),
    class_id UUID REFERENCES sclasses(id),
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_student_status ON library(student_id, status);
CREATE INDEX IF NOT EXISTS idx_library_status_due ON library(status, due_date);

-- ============================================
-- CLINIC TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clinic (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    visit_date TIMESTAMPTZ DEFAULT NOW(),
    visit_time TEXT NOT NULL,
    chief_complaint TEXT NOT NULL,
    incident_type TEXT CHECK (incident_type IN ('illness', 'injury', 'accident', 'emergency', 'routine_checkup', 'medication', 'first_aid', 'other')) NOT NULL,
    incident_details JSONB DEFAULT '{}',
    symptoms JSONB DEFAULT '[]',
    vital_signs JSONB DEFAULT '{}',
    diagnosis TEXT NOT NULL,
    treatment JSONB DEFAULT '{}',
    outcome TEXT CHECK (outcome IN ('returned_to_class', 'sent_home', 'referred_to_hospital', 'parent_contacted', 'observation_required', 'follow_up_needed')) NOT NULL,
    leave_request JSONB DEFAULT '{"required": false}',
    parent_notification JSONB DEFAULT '{"notified": false}',
    follow_up JSONB DEFAULT '{"required": false}',
    attended_by UUID REFERENCES users(id),
    class_id UUID REFERENCES sclasses(id),
    school_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    case_report TEXT,
    confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinic_student_date ON clinic(student_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_clinic_school_date ON clinic(school_id, visit_date);

-- ============================================
-- ROW LEVEL SECURITY (Optional - enable as needed)
-- ============================================
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
