export interface MalariaSurveillanceData {
  id: string;
  country?: string;
  region: string;
  district?: string;
  health_facility?: string;
  date: Date;
  reporting_period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  data_source?: string;

  // Case metrics
  suspected_cases?: number;
  tested_cases?: number;
  confirmed_cases: number;
  confirmed_cases_pf?: number;
  confirmed_cases_pv?: number;
  confirmed_cases_pm?: number;
  confirmed_cases_po?: number;
  confirmed_cases_pk?: number;
  severe_cases?: number;
  hospitalized_cases?: number;
  deaths?: number;

  // Rates and ratios
  test_positivity_rate?: number;
  case_fatality_rate?: number;
  annual_parasite_index?: number;
  proportion_under5?: number;

  // Diagnostic methods
  rdt_positive?: number;
  microscopy_positive?: number;
  pcr_positive?: number;

  // Treatment metrics
  act_treatment_courses?: number;
  cq_treatment_courses?: number;
  treatment_failure_cases?: number;

  // Prevention metrics
  itn_distributed?: number;
  itn_usage_rate?: number;
  irs_coverage?: number;
  iptp_coverage?: number;
  seasonal_chemoprevention?: number;

  // Vector control
  larval_habitat_sites?: number;
  breeding_sites_treated?: number;

  // Resistance monitoring
  artemisinin_resistance_suspected?: number;
  insecticide_resistance_reported?: boolean;

  // Environmental factors
  rainfall_mm?: number;
  temperature_avg?: number;
  humidity_avg?: number;

  // Demographic distributions
  age_distribution?: {
    under5?: number;
    '5-14'?: number;
    '15-49'?: number;
    '50plus'?: number;
    [key: string]: number | undefined; // Allow for other age groups if necessary
  };
  gender_distribution?: {
    male?: number;
    female?: number;
    [key: string]: number | undefined; // Allow for other genders if necessary
  };
  risk_group_distribution?: {
    pregnant?: number;
    under5?: number;
    travelers?: number;
    [key: string]: number | undefined; // Allow for other risk groups if necessary
  };

  // Quality indicators
  data_completeness?: number;
  data_accuracy_flag?: boolean;

  // Metadata
  created_at: Date;
  updated_at: Date;
  reporting_officer?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
} 