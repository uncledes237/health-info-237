export interface CaseReport {
  id: string;
  user_id: string;
  disease_type: 'malaria' | 'diabetes';
  region: string;
  date_reported: Date;
  symptoms: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'pending' | 'confirmed' | 'rejected';
  notes: string;
  created_at: Date;
  updated_at: Date;
} 