-- ==============================================================================
-- SI-PKL SMART (Sistem Informasi Presensi & Monitoring Siswa SMK)
-- PostgreSQL + Supabase Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('student', 'advisor', 'homeroom', 'admin');
CREATE TYPE attendance_type AS ENUM ('DATANG', 'PULANG');
CREATE TYPE attendance_status AS ENUM ('HADIR', 'ALPA', 'SAKIT', 'IZIN');
CREATE TYPE location_status AS ENUM ('DALAM_AREA', 'LUAR_AREA', 'GPS_TIDAK_AKURAT', 'BELUM_TERVERIFIKASI');
CREATE TYPE request_status AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK');

-- ------------------------------------------------------------------------------
-- 2. PROFILES (Extends auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. CLASSES (Kelas SMK)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g. "XII RPL 1"
    department VARCHAR(100) NOT NULL, -- e.g. "Rekayasa Perangkat Lunak"
    academic_year VARCHAR(20) NOT NULL DEFAULT '2026/2027',
    homeroom_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. INDUSTRIES (Dunia Usaha & Dunia Industri - DUDI)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    sector VARCHAR(100),
    address TEXT NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(30),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INT NOT NULL DEFAULT 100,
    check_in_start TIME NOT NULL DEFAULT '07:00:00',
    check_in_end TIME NOT NULL DEFAULT '08:00:00',
    check_out_start TIME NOT NULL DEFAULT '16:00:00',
    check_out_end TIME NOT NULL DEFAULT '18:00:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. STUDENTS (Data Siswa)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    nis VARCHAR(20) NOT NULL UNIQUE,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('L', 'P')),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    industry_id UUID REFERENCES public.industries(id) ON DELETE SET NULL,
    advisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    parent_phone VARCHAR(30),
    student_phone VARCHAR(30),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. ATTENDANCE RECORDS (Presensi Harian)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'HADIR',
    
    -- Check In (Datang)
    check_in_time TIMESTAMPTZ,
    check_in_latitude DOUBLE PRECISION,
    check_in_longitude DOUBLE PRECISION,
    check_in_accuracy DOUBLE PRECISION,
    check_in_location_status location_status DEFAULT 'BELUM_TERVERIFIKASI',
    check_in_photo_path TEXT,
    check_in_photo_watermarked_path TEXT,
    check_in_distance_meters INT,

    -- Check Out (Pulang)
    check_out_time TIMESTAMPTZ,
    check_out_latitude DOUBLE PRECISION,
    check_out_longitude DOUBLE PRECISION,
    check_out_accuracy DOUBLE PRECISION,
    check_out_location_status location_status DEFAULT 'BELUM_TERVERIFIKASI',
    check_out_photo_path TEXT,
    check_out_photo_watermarked_path TEXT,
    check_out_distance_meters INT,

    notes TEXT,
    is_field_duty BOOLEAN NOT NULL DEFAULT FALSE,
    field_duty_reason TEXT,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent multiple records for same student on same work date
    CONSTRAINT unique_student_work_date UNIQUE(student_id, work_date)
);

-- ------------------------------------------------------------------------------
-- 7. ABSENCE REQUESTS (Pengajuan Izin & Sakit)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.absence_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IZIN', 'SAKIT')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INT NOT NULL CHECK (duration_days > 0),
    reason TEXT NOT NULL CHECK (char_length(trim(reason)) > 0), -- Keterangan wajib diisi!
    attachment_path TEXT,
    status request_status NOT NULL DEFAULT 'MENUNGGU',
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. AUDIT LOGS (Pencatatan Koreksi & Perubahan Data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    reason TEXT NOT NULL,
    performed_by UUID NOT NULL REFERENCES public.profiles(id),
    performed_by_name VARCHAR(150) NOT NULL,
    performed_by_role user_role NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_industry_id ON public.students(industry_id);
CREATE INDEX IF NOT EXISTS idx_students_advisor_id ON public.students(advisor_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance_records(student_id, work_date);
CREATE INDEX IF NOT EXISTS idx_attendance_work_date ON public.attendance_records(work_date);
CREATE INDEX IF NOT EXISTS idx_absence_student ON public.absence_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_id);

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user role
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can view all profiles in school, can update their own
CREATE POLICY "Profiles viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Classes: Viewable by all authenticated, manageable by admin
CREATE POLICY "Classes viewable by all authenticated"
    ON public.classes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can modify classes"
    ON public.classes FOR ALL
    TO authenticated
    USING (public.get_current_role() = 'admin');

-- Industries: Viewable by all, manageable by admin
CREATE POLICY "Industries viewable by all authenticated"
    ON public.industries FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can modify industries"
    ON public.industries FOR ALL
    TO authenticated
    USING (public.get_current_role() = 'admin');

-- Students:
-- Siswa can view only their own record.
-- Advisor can view students they mentor.
-- Homeroom can view students in their assigned class.
-- Admin can view all.
CREATE POLICY "Student access policy"
    ON public.students FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
        OR public.get_current_role() = 'admin'
        OR (public.get_current_role() = 'advisor' AND advisor_id = auth.uid())
        OR (public.get_current_role() = 'homeroom' AND class_id IN (
            SELECT id FROM public.classes WHERE homeroom_teacher_id = auth.uid()
        ))
    );

CREATE POLICY "Admin can modify students"
    ON public.students FOR ALL
    TO authenticated
    USING (public.get_current_role() = 'admin');

-- Attendance Records:
-- Siswa can view and insert their own attendance for current day, cannot alter existing final.
-- Advisor & Homeroom can view attendance for their students.
-- Admin has full access.
CREATE POLICY "Attendance view policy"
    ON public.attendance_records FOR SELECT
    TO authenticated
    USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
        OR public.get_current_role() = 'admin'
        OR (public.get_current_role() = 'advisor' AND student_id IN (
            SELECT id FROM public.students WHERE advisor_id = auth.uid()
        ))
        OR (public.get_current_role() = 'homeroom' AND student_id IN (
            SELECT s.id FROM public.students s
            JOIN public.classes c ON s.class_id = c.id
            WHERE c.homeroom_teacher_id = auth.uid()
        ))
    );

CREATE POLICY "Student can insert check in"
    ON public.attendance_records FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    );

CREATE POLICY "Student can update check out on same date"
    ON public.attendance_records FOR UPDATE
    TO authenticated
    USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
        AND work_date = CURRENT_DATE
    );

CREATE POLICY "Teacher & Admin can update attendance for correction"
    ON public.attendance_records FOR UPDATE
    TO authenticated
    USING (
        public.get_current_role() IN ('admin', 'homeroom', 'advisor')
    );

-- Absence Requests:
CREATE POLICY "Absence view policy"
    ON public.absence_requests FOR SELECT
    TO authenticated
    USING (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
        OR public.get_current_role() IN ('admin', 'advisor', 'homeroom')
    );

CREATE POLICY "Student can insert absence request"
    ON public.absence_requests FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    );

CREATE POLICY "Teacher can approve or reject absence"
    ON public.absence_requests FOR UPDATE
    TO authenticated
    USING (
        public.get_current_role() IN ('admin', 'advisor', 'homeroom')
    );

-- Audit Logs: Viewable by teachers and admin, insertable by system
CREATE POLICY "Audit logs viewable by staff"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.get_current_role() IN ('admin', 'homeroom', 'advisor'));

CREATE POLICY "Audit logs insertable by authenticated users"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 11. SUPABASE STORAGE BUCKET POLICIES (Run in SQL or Storage UI)
-- ------------------------------------------------------------------------------
-- In Supabase Storage:
-- 1. Create a bucket named "attendance-photos" with public: false
-- 2. Create a bucket named "absence-attachments" with public: false
-- 3. Storage RLS ensures only authenticated students can upload, and authorized teachers can download via signed URLs.
