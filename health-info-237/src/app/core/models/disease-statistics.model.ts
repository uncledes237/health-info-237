export interface DiseaseStatistics {
  id: string;
  disease_type: 'malaria' | 'diabetes';
  region: string;
  year: number;
  month: number;
  
  // Common statistics
  total_cases: number;
  new_cases: number;
  
  // Malaria specific statistics
  incidence_rate?: number;
  prevalence_rate?: number;
  detection_rate?: number;
  hospitalization_rate?: number;
  mortality_rate?: number;
  treatment_adherence_rate?: number;
  community_awareness_level?: number;
  
  // Diabetes specific statistics
  type1_cases?: number;
  type2_cases?: number;
  gestational_cases?: number;
  
  created_at: Date;
  updated_at: Date;
} 