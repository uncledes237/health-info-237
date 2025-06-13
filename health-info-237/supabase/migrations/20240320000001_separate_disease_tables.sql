-- Create separate tables for malaria and diabetes data
CREATE TABLE malaria_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region TEXT NOT NULL,
    date DATE NOT NULL,
    total_cases INTEGER NOT NULL,
    active_cases INTEGER NOT NULL,
    recovered_cases INTEGER NOT NULL,
    deaths INTEGER NOT NULL,
    incidence DECIMAL(5,2),
    prevalence DECIMAL(5,2),
    age_distribution JSONB,
    gender_distribution JSONB,
    geographic_distribution JSONB,
    parasite_species_distribution JSONB,
    detection_rate DECIMAL(5,2),
    hospitalization_rate DECIMAL(5,2),
    mortality_rate DECIMAL(5,2),
    treatment_adherence_rate DECIMAL(5,2),
    preventive_measures_data JSONB,
    community_awareness_level DECIMAL(5,2),
    vector_control_data JSONB,
    environmental_factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(region, date)
);

CREATE TABLE diabetes_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region TEXT NOT NULL,
    date DATE NOT NULL,
    total_cases INTEGER NOT NULL,
    active_cases INTEGER NOT NULL,
    recovered_cases INTEGER NOT NULL,
    deaths INTEGER NOT NULL,
    type1_cases INTEGER,
    type2_cases INTEGER,
    gestational_cases INTEGER,
    hba1c_levels JSONB,
    treatment_adherence JSONB,
    complications JSONB,
    risk_factors JSONB,
    screening_data JSONB,
    age_distribution JSONB,
    gender_distribution JSONB,
    geographic_distribution JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(region, date)
);

-- Create separate case tables for malaria and diabetes
CREATE TABLE malaria_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region TEXT NOT NULL,
    case_date DATE NOT NULL,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    status TEXT NOT NULL CHECK (status IN ('active', 'recovered', 'deceased')),
    parasite_species TEXT,
    symptoms JSONB,
    treatment TEXT,
    outcome TEXT,
    preventive_measures_used JSONB,
    environmental_factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE diabetes_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region TEXT NOT NULL,
    case_date DATE NOT NULL,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    status TEXT NOT NULL CHECK (status IN ('active', 'recovered', 'deceased')),
    diabetes_type TEXT CHECK (diabetes_type IN ('type1', 'type2', 'gestational')),
    hba1c_level DECIMAL,
    complications JSONB,
    risk_factors JSONB,
    treatment_plan JSONB,
    follow_up_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX idx_malaria_data_region_date ON malaria_data(region, date);
CREATE INDEX idx_diabetes_data_region_date ON diabetes_data(region, date);
CREATE INDEX idx_malaria_cases_region_date ON malaria_cases(region, case_date);
CREATE INDEX idx_diabetes_cases_region_date ON diabetes_cases(region, case_date);

-- Add RLS policies
ALTER TABLE malaria_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE diabetes_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE malaria_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE diabetes_cases ENABLE ROW LEVEL SECURITY;

-- Policies for malaria_data
CREATE POLICY "Malaria data is viewable by everyone"
    ON malaria_data FOR SELECT
    USING (true);

CREATE POLICY "Malaria data is insertable by authenticated users"
    ON malaria_data FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policies for diabetes_data
CREATE POLICY "Diabetes data is viewable by everyone"
    ON diabetes_data FOR SELECT
    USING (true);

CREATE POLICY "Diabetes data is insertable by authenticated users"
    ON diabetes_data FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policies for malaria_cases
CREATE POLICY "Malaria cases are viewable by everyone"
    ON malaria_cases FOR SELECT
    USING (true);

CREATE POLICY "Malaria cases are insertable by authenticated users"
    ON malaria_cases FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policies for diabetes_cases
CREATE POLICY "Diabetes cases are viewable by everyone"
    ON diabetes_cases FOR SELECT
    USING (true);

CREATE POLICY "Diabetes cases are insertable by authenticated users"
    ON diabetes_cases FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Add triggers for updated_at
CREATE TRIGGER update_malaria_data_updated_at
    BEFORE UPDATE ON malaria_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diabetes_data_updated_at
    BEFORE UPDATE ON diabetes_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_malaria_cases_updated_at
    BEFORE UPDATE ON malaria_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diabetes_cases_updated_at
    BEFORE UPDATE ON diabetes_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for malaria
INSERT INTO malaria_data (
    region, date, total_cases, active_cases, recovered_cases, deaths,
    incidence, prevalence, detection_rate, hospitalization_rate, mortality_rate,
    treatment_adherence_rate, community_awareness_level,
    age_distribution, gender_distribution, geographic_distribution,
    parasite_species_distribution, preventive_measures_data,
    vector_control_data, environmental_factors
) VALUES
    ('Southwest', CURRENT_DATE - INTERVAL '30 days', 2000, 1500, 450, 50,
     0.15, 0.08, 0.85, 0.20, 0.02,
     0.90, 0.75,
     '{"0-5": 200, "6-15": 400, "16-30": 600, "31-50": 500, "50+": 300}',
     '{"male": 1000, "female": 1000}',
     '{"urban": 800, "rural": 1200}',
     '{"falciparum": 1500, "vivax": 400, "ovale": 50, "malariae": 50}',
     '{"itn_usage": 0.80, "spraying_coverage": 0.70}',
     '{"larviciding": 0.60, "fogging": 0.50}',
     '{"rainfall": "high", "temperature": "warm", "humidity": "high"}'
    ),
    ('Northwest', CURRENT_DATE - INTERVAL '30 days', 1800, 1300, 450, 50,
     0.12, 0.07, 0.82, 0.18, 0.02,
     0.88, 0.72,
     '{"0-5": 180, "6-15": 360, "16-30": 540, "31-50": 450, "50+": 270}',
     '{"male": 900, "female": 900}',
     '{"urban": 720, "rural": 1080}',
     '{"falciparum": 1350, "vivax": 360, "ovale": 45, "malariae": 45}',
     '{"itn_usage": 0.75, "spraying_coverage": 0.65}',
     '{"larviciding": 0.55, "fogging": 0.45}',
     '{"rainfall": "moderate", "temperature": "warm", "humidity": "moderate"}'
    );

-- Insert sample data for diabetes
INSERT INTO diabetes_data (
    region, date, total_cases, active_cases, recovered_cases, deaths,
    type1_cases, type2_cases, gestational_cases,
    hba1c_levels, treatment_adherence, complications, risk_factors,
    screening_data, age_distribution, gender_distribution, geographic_distribution
) VALUES
    ('Southwest', CURRENT_DATE - INTERVAL '30 days', 1500, 1200, 250, 50,
     300, 1000, 200,
     '{"normal": 400, "prediabetes": 500, "diabetes": 600}',
     '{"medication": 75, "diet": 60, "exercise": 45}',
     '{"cardiovascular": 200, "renal": 150, "neuropathy": 100, "retinopathy": 80}',
     '{"obesity": 400, "hypertension": 350, "smoking": 200, "physical_inactivity": 450}',
     '{"total_screened": 2000, "newly_diagnosed": 150, "follow_up_rate": 85}',
     '{"0-30": 150, "31-50": 600, "51-70": 600, "70+": 150}',
     '{"male": 750, "female": 750}',
     '{"urban": 900, "rural": 600}'
    ),
    ('Northwest', CURRENT_DATE - INTERVAL '30 days', 1200, 900, 250, 50,
     250, 800, 150,
     '{"normal": 350, "prediabetes": 450, "diabetes": 400}',
     '{"medication": 70, "diet": 55, "exercise": 40}',
     '{"cardiovascular": 180, "renal": 120, "neuropathy": 90, "retinopathy": 70}',
     '{"obesity": 350, "hypertension": 300, "smoking": 180, "physical_inactivity": 400}',
     '{"total_screened": 1800, "newly_diagnosed": 120, "follow_up_rate": 80}',
     '{"0-30": 120, "31-50": 480, "51-70": 480, "70+": 120}',
     '{"male": 600, "female": 600}',
     '{"urban": 720, "rural": 480}'
    );

-- Insert sample malaria cases
INSERT INTO malaria_cases (
    region, case_date, age, gender, status,
    parasite_species, symptoms, treatment, outcome,
    preventive_measures_used, environmental_factors
) VALUES
    ('Southwest', CURRENT_DATE - INTERVAL '5 days', 25, 'male', 'active',
     'falciparum',
     '{"fever": true, "headache": true, "chills": true, "fatigue": true}',
     'artemisinin-based combination therapy',
     'under_treatment',
     '{"itn": true, "spraying": false}',
     '{"rainfall": "high", "temperature": "warm", "humidity": "high"}'
    ),
    ('Northwest', CURRENT_DATE - INTERVAL '3 days', 30, 'female', 'recovered',
     'vivax',
     '{"fever": true, "fatigue": true, "nausea": true}',
     'chloroquine',
     'recovered',
     '{"itn": true, "spraying": true}',
     '{"rainfall": "moderate", "temperature": "warm", "humidity": "moderate"}'
    );

-- Insert sample diabetes cases
INSERT INTO diabetes_cases (
    region, case_date, age, gender, status,
    diabetes_type, hba1c_level, complications, risk_factors,
    treatment_plan, follow_up_status
) VALUES
    ('Southwest', CURRENT_DATE - INTERVAL '5 days', 45, 'male', 'active',
     'type2', 8.5,
     '{"cardiovascular": true, "hypertension": true}',
     '{"obesity": true, "physical_inactivity": true}',
     '{"medication": "metformin", "diet": "low-carb", "exercise": "30min daily"}',
     'scheduled'
    ),
    ('Northwest', CURRENT_DATE - INTERVAL '3 days', 35, 'female', 'active',
     'type1', 7.2,
     '{"retinopathy": true}',
     '{"smoking": true}',
     '{"medication": "insulin", "diet": "balanced", "exercise": "45min daily"}',
     'completed'
    ); 