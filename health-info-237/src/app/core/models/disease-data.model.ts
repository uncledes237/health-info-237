export interface DiseaseData {
  id: string;
  disease_type: 'malaria' | 'diabetes';
  region: string;
  date: Date;
  total_cases: number;
  active_cases: number;
  recovered_cases: number;
  deaths: number;
  
  // Common properties for both diseases
  total: number;
  active: number;
  recovered: number;
  
  // Malaria specific fields
  incidence?: number;
  prevalence?: number;
  age_distribution?: {
    [key: string]: number;
  };
  gender_distribution?: {
    [key: string]: number;
  };
  geographic_distribution?: {
    [key: string]: number;
  };
  parasite_species_distribution?: {
    [key: string]: number;
  };
  detection_rate?: number;
  hospitalization_rate?: number;
  mortality_rate?: number;
  treatment_adherence_rate?: number;
  preventive_measures_data?: {
    itn_usage: number;
    spraying_coverage: number;
  };
  community_awareness_level?: number;
  vector_control_data?: {
    larviciding: number;
    fogging: number;
  };
  environmental_factors?: {
    rainfall: string;
    temperature: string;
    humidity: string;
  };
  
  // Diabetes specific fields
  type1?: number;
  type2?: number;
  gestational?: number;
  hba1c_levels?: {
    normal: number;
    prediabetes: number;
    diabetes: number;
  };
  treatment_adherence?: {
    medication: number;
    diet: number;
    exercise: number;
  };
  complications?: {
    cardiovascular: number;
    renal: number;
    neuropathy: number;
    retinopathy: number;
  };
  risk_factors?: {
    obesity: number;
    hypertension: number;
    smoking: number;
    physical_inactivity: number;
  };
  screening_data?: {
    total_screened: number;
    newly_diagnosed: number;
    follow_up_rate: number;
  };
  
  created_at: Date;
  updated_at: Date;
} 