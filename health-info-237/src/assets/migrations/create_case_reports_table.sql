-- Create case_reports table
CREATE TABLE IF NOT EXISTS case_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    region VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location_details TEXT,
    phone VARCHAR(20) NOT NULL,
    additional_contact TEXT,
    reporter_id UUID NOT NULL REFERENCES auth.users(id),
    reporter_name VARCHAR(255) NOT NULL,
    reporter_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on reporter_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_case_reports_reporter_id ON case_reports(reporter_id);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_case_reports_status ON case_reports(status);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_case_reports_created_at ON case_reports(created_at);

-- Add RLS policies
ALTER TABLE case_reports ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own reports
CREATE POLICY "Users can insert their own reports"
    ON case_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

-- Allow users to view their own reports
CREATE POLICY "Users can view their own reports"
    ON case_reports
    FOR SELECT
    TO authenticated
    USING (auth.uid() = reporter_id);

-- Allow admins to view all reports
CREATE POLICY "Admins can view all reports"
    ON case_reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update report status
CREATE POLICY "Admins can update report status"
    ON case_reports
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    ); 