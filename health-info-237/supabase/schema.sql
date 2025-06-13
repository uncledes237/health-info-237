-- Create tables for disease data
CREATE TABLE disease_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    disease_type TEXT NOT NULL CHECK (disease_type IN ('malaria', 'diabetes')),
    region TEXT NOT NULL,
    date DATE NOT NULL,
    
    -- Common fields
    total_cases INTEGER NOT NULL,
    
    -- Malaria specific fields
    incidence INTEGER,
    prevalence INTEGER,
    age_distribution JSONB, -- Store age distribution as JSON
    gender_distribution JSONB, -- Store gender distribution as JSON
    geographic_distribution JSONB, -- Store urban/rural distribution
    parasite_species_distribution JSONB, -- Store parasite species distribution
    detection_rate DECIMAL(5,2),
    hospitalization_rate DECIMAL(5,2),
    mortality_rate DECIMAL(5,2),
    treatment_adherence_rate DECIMAL(5,2),
    preventive_measures_data JSONB, -- Store ITNs, spraying data
    community_awareness_level DECIMAL(5,2),
    vector_control_data JSONB, -- Store mosquito control measures
    environmental_factors JSONB, -- Store environmental factors
    
    -- Diabetes specific fields
    type1_cases INTEGER,
    type2_cases INTEGER,
    gestational_cases INTEGER,
    
    -- Common metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for user profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'health_official', 'user')),
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create table for case reports
CREATE TABLE case_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    disease_type TEXT NOT NULL CHECK (disease_type IN ('malaria', 'diabetes')),
    region TEXT NOT NULL,
    date_reported DATE NOT NULL,
    symptoms TEXT,
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('alert', 'update', 'report')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for user preferences
CREATE TABLE user_preferences (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    notification_settings JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
    dashboard_layout JSONB DEFAULT '{"layout": "default"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for disease statistics
CREATE TABLE disease_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    disease_type TEXT NOT NULL CHECK (disease_type IN ('malaria', 'diabetes')),
    region TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    
    -- Common statistics
    total_cases INTEGER NOT NULL,
    new_cases INTEGER NOT NULL,
    
    -- Malaria specific statistics
    incidence_rate DECIMAL(5,2),
    prevalence_rate DECIMAL(5,2),
    detection_rate DECIMAL(5,2),
    hospitalization_rate DECIMAL(5,2),
    mortality_rate DECIMAL(5,2),
    treatment_adherence_rate DECIMAL(5,2),
    community_awareness_level DECIMAL(5,2),
    
    -- Diabetes specific statistics
    type1_cases INTEGER,
    type2_cases INTEGER,
    gestational_cases INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(disease_type, region, year, month)
);

-- Create indexes for better query performance
CREATE INDEX idx_disease_data_type_region ON disease_data(disease_type, region);
CREATE INDEX idx_disease_data_date ON disease_data(date);
CREATE INDEX idx_case_reports_user ON case_reports(user_id);
CREATE INDEX idx_case_reports_status ON case_reports(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_disease_data_type_date ON disease_data(disease_type, date);
CREATE INDEX idx_case_reports_type_date ON case_reports(disease_type, date_reported);
CREATE INDEX idx_disease_statistics_type_year_month ON disease_statistics(disease_type, year, month);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_disease_data_updated_at
    BEFORE UPDATE ON disease_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_reports_updated_at
    BEFORE UPDATE ON case_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disease_statistics_updated_at
    BEFORE UPDATE ON disease_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE disease_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_statistics ENABLE ROW LEVEL SECURITY;

-- Policies for disease_data
CREATE POLICY "Disease data is viewable by everyone"
    ON disease_data FOR SELECT
    USING (true);

CREATE POLICY "Disease data is insertable by authenticated users"
    ON disease_data FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Disease data is updatable by authenticated users"
    ON disease_data FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Policies for case_reports
CREATE POLICY "Case reports are viewable by everyone"
    ON case_reports FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert case reports"
    ON case_reports FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own case reports"
    ON case_reports FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for user_preferences
CREATE POLICY "Users can view their own user preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own user preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for disease_statistics
CREATE POLICY "Users can view their own disease statistics"
    ON disease_statistics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own disease statistics"
    ON disease_statistics FOR UPDATE
    USING (auth.uid() = user_id); 