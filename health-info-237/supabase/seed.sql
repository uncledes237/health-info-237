-- Insert sample health facilities
INSERT INTO health_facilities (name, region, type, address, contact_info, capacity, services)
VALUES
    ('Central Hospital', 'Southwest', 'hospital', '123 Main St, Buea', 
     '{"phone": "+237123456789", "email": "central@health.cm"}', 
     500, 
     '{"emergency": true, "surgery": true, "pediatrics": true, "diabetes": true, "malaria": true}'),
    
    ('Community Health Center', 'Northwest', 'health_center', '456 Health Ave, Bamenda',
     '{"phone": "+237987654321", "email": "community@health.cm"}',
     200,
     '{"emergency": true, "pediatrics": true, "diabetes": true, "malaria": true}'),
    
    ('Regional Clinic', 'Littoral', 'clinic', '789 Medical Blvd, Douala',
     '{"phone": "+237456789123", "email": "regional@health.cm"}',
     100,
     '{"emergency": true, "diabetes": true, "malaria": true}');

-- Insert sample disease data for diabetes
INSERT INTO disease_data (
    disease_type, region, date, total_cases,
    type1_cases, type2_cases, gestational_cases,
    hba1c_levels, treatment_adherence, complications, risk_factors, screening_data
)
VALUES
    ('diabetes', 'Southwest', CURRENT_DATE - INTERVAL '30 days', 1500,
     300, 1000, 200,
     '{"normal": 400, "prediabetes": 500, "diabetes": 600}',
     '{"medication": 75, "diet": 60, "exercise": 45}',
     '{"cardiovascular": 200, "renal": 150, "neuropathy": 100, "retinopathy": 80}',
     '{"obesity": 400, "hypertension": 350, "smoking": 200, "physical_inactivity": 450}',
     '{"total_screened": 2000, "newly_diagnosed": 150, "follow_up_rate": 85}'),
    
    ('diabetes', 'Northwest', CURRENT_DATE - INTERVAL '30 days', 1200,
     250, 800, 150,
     '{"normal": 350, "prediabetes": 450, "diabetes": 400}',
     '{"medication": 70, "diet": 55, "exercise": 40}',
     '{"cardiovascular": 180, "renal": 120, "neuropathy": 90, "retinopathy": 70}',
     '{"obesity": 350, "hypertension": 300, "smoking": 180, "physical_inactivity": 400}',
     '{"total_screened": 1800, "newly_diagnosed": 120, "follow_up_rate": 80}');

-- Insert sample disease data for malaria
INSERT INTO disease_data (
    disease_type, region, date, total_cases,
    incidence, prevalence, detection_rate, hospitalization_rate, mortality_rate,
    treatment_adherence_rate, community_awareness_level,
    preventive_measures_data, vector_control_data, environmental_factors
)
VALUES
    ('malaria', 'Southwest', CURRENT_DATE - INTERVAL '30 days', 2000,
     0.15, 0.08, 0.85, 0.20, 0.02,
     0.90, 0.75,
     '{"itn_usage": 0.80, "spraying_coverage": 0.70}',
     '{"larviciding": 0.60, "fogging": 0.50}',
     '{"rainfall": "high", "temperature": "warm", "humidity": "high"}'),
    
    ('malaria', 'Northwest', CURRENT_DATE - INTERVAL '30 days', 1800,
     0.12, 0.07, 0.82, 0.18, 0.02,
     0.88, 0.72,
     '{"itn_usage": 0.75, "spraying_coverage": 0.65}',
     '{"larviciding": 0.55, "fogging": 0.45}',
     '{"rainfall": "moderate", "temperature": "warm", "humidity": "moderate"}');

-- Insert sample disease cases
INSERT INTO disease_cases (
    disease_type, region, case_date, age, gender, status,
    diabetes_type, hba1c_level, complications, risk_factors
)
VALUES
    ('diabetes', 'Southwest', CURRENT_DATE - INTERVAL '5 days', 45, 'male', 'active',
     'type2', 8.5,
     '{"cardiovascular": true, "hypertension": true}',
     '{"obesity": true, "physical_inactivity": true}'),
    
    ('diabetes', 'Northwest', CURRENT_DATE - INTERVAL '3 days', 35, 'female', 'active',
     'type1', 7.2,
     '{"retinopathy": true}',
     '{"smoking": true}');

INSERT INTO disease_cases (
    disease_type, region, case_date, age, gender, status,
    parasite_species, symptoms, treatment, outcome
)
VALUES
    ('malaria', 'Southwest', CURRENT_DATE - INTERVAL '5 days', 25, 'male', 'active',
     'falciparum',
     '{"fever": true, "headache": true, "chills": true}',
     'artemisinin-based combination therapy',
     'under_treatment'),
    
    ('malaria', 'Northwest', CURRENT_DATE - INTERVAL '3 days', 30, 'female', 'recovered',
     'vivax',
     '{"fever": true, "fatigue": true}',
     'chloroquine',
     'recovered');

-- Insert sample disease statistics for malaria
INSERT INTO disease_statistics (
    disease_type, region, year, month,
    total_cases, new_cases,
    incidence_rate, prevalence_rate, detection_rate,
    hospitalization_rate, mortality_rate, treatment_adherence_rate,
    community_awareness_level
)
VALUES
    ('malaria', 'Southwest', EXTRACT(YEAR FROM CURRENT_DATE), EXTRACT(MONTH FROM CURRENT_DATE),
    150, 45,
    30.0, 70.0, 85.5,
    25.3, 6.7, 78.5,
    72.5
    );

-- Insert sample case reports for malaria
INSERT INTO case_reports (
    disease_type, region, symptoms, severity, status,
    age, gender, geographic_location, parasite_species,
    preventive_measures_used, environmental_factors
)
VALUES
    ('malaria', 'Southwest', ARRAY['fever', 'chills', 'headache'], 'moderate', 'confirmed',
    25, 'male', 'rural', 'falciparum',
    ARRAY['itn', 'spraying'],
    ARRAY['high_rainfall', 'high_humidity']
    );

-- Insert sample notifications
INSERT INTO notifications (title, message, type)
VALUES
    ('New Malaria Case Report', 'A new malaria case has been reported in Southwest region', 'alert'),
    ('Malaria Statistics Update', 'Monthly malaria statistics have been updated', 'update'),
    ('Case Confirmation', 'Your malaria case report has been confirmed by a health official', 'report');

-- Insert sample case reports
INSERT INTO case_reports (user_id, disease_type, region, date_reported, symptoms, severity, status, notes)
VALUES
    (NULL, 'diabetes', 'Southwest', CURRENT_DATE - INTERVAL '4 days', 'Increased thirst, frequent urination', 'mild', 'confirmed', 'Type 2 diabetes diagnosed'),
    (NULL, 'diabetes', 'Southwest', CURRENT_DATE - INTERVAL '2 days', 'Fatigue, blurred vision', 'moderate', 'confirmed', 'Type 1 diabetes suspected'); 