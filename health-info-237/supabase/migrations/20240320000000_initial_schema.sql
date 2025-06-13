-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'health_worker', 'viewer')),
    region TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('alert', 'info', 'warning')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create disease_data table
CREATE TABLE disease_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_type TEXT NOT NULL CHECK (disease_type IN ('malaria', 'diabetes')),
    region TEXT NOT NULL,
    date DATE NOT NULL,
    total_cases INTEGER NOT NULL,
    
    -- Common fields
    incidence DECIMAL,
    prevalence DECIMAL,
    age_distribution JSONB,
    gender_distribution JSONB,
    geographic_distribution JSONB,
    
    -- Malaria specific fields
    parasite_species_distribution JSONB,
    detection_rate DECIMAL,
    hospitalization_rate DECIMAL,
    mortality_rate DECIMAL,
    treatment_adherence_rate DECIMAL,
    preventive_measures_data JSONB,
    community_awareness_level DECIMAL,
    vector_control_data JSONB,
    environmental_factors JSONB,
    
    -- Diabetes specific fields
    type1_cases INTEGER,
    type2_cases INTEGER,
    gestational_cases INTEGER,
    hba1c_levels JSONB,
    treatment_adherence JSONB,
    complications JSONB,
    risk_factors JSONB,
    screening_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Add unique constraint to prevent duplicate entries
    UNIQUE(disease_type, region, date)
);

-- Create disease_cases table for detailed case information
CREATE TABLE disease_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_type TEXT NOT NULL CHECK (disease_type IN ('malaria', 'diabetes')),
    region TEXT NOT NULL,
    case_date DATE NOT NULL,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    status TEXT NOT NULL CHECK (status IN ('active', 'recovered', 'deceased')),
    
    -- Malaria specific fields
    parasite_species TEXT,
    symptoms JSONB,
    treatment TEXT,
    outcome TEXT,
    
    -- Diabetes specific fields
    diabetes_type TEXT CHECK (diabetes_type IN ('type1', 'type2', 'gestational')),
    hba1c_level DECIMAL,
    complications JSONB,
    risk_factors JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create health_facilities table
CREATE TABLE health_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('hospital', 'clinic', 'health_center')),
    address TEXT,
    contact_info JSONB,
    capacity INTEGER,
    services JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create health_workers table
CREATE TABLE health_workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES health_facilities(id) ON DELETE SET NULL,
    specialization TEXT,
    license_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_workers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Disease data policies
CREATE POLICY "Anyone can view disease data"
    ON disease_data FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert disease data"
    ON disease_data FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    ));

-- Disease cases policies
CREATE POLICY "Health workers can view disease cases in their region"
    ON disease_cases FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.region = disease_cases.region
    ));

-- Health facilities policies
CREATE POLICY "Anyone can view health facilities"
    ON health_facilities FOR SELECT
    USING (true);

-- Health workers policies
CREATE POLICY "Anyone can view health workers"
    ON health_workers FOR SELECT
    USING (true);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disease_data_updated_at
    BEFORE UPDATE ON disease_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disease_cases_updated_at
    BEFORE UPDATE ON disease_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_facilities_updated_at
    BEFORE UPDATE ON health_facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_workers_updated_at
    BEFORE UPDATE ON health_workers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 