import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-upload',
  template: `
    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Data Upload</ion-card-title>
                <ion-card-subtitle>Manually enter or upload health data for analysis</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <!-- Manual Data Entry Forms -->
                <ion-segment [value]="selectedSegment" (ionChange)="onSegmentChange($event)">
                  <ion-segment-button value="malaria">
                    <ion-label>Manual Malaria Data</ion-label>
                  </ion-segment-button>
                  <ion-segment-button value="diabetes">
                    <ion-label>Manual Diabetes Data</ion-label>
                  </ion-segment-button>
                </ion-segment>

                <div *ngIf="selectedSegment === 'malaria'">
                  <form [formGroup]="malariaForm" (ngSubmit)="onSubmitMalaria()">
                    <ion-list>
                      <ion-item>
                        <ion-label position="floating">Country</ion-label>
                        <ion-input formControlName="country" type="text"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Region</ion-label>
                        <ion-input formControlName="region" type="text"></ion-input>
                        <ion-note slot="error" *ngIf="malariaForm.get('region')?.invalid && malariaForm.get('region')?.touched">
                          Region is required.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">District</ion-label>
                        <ion-input formControlName="district" type="text"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Health Facility</ion-label>
                        <ion-input formControlName="health_facility" type="text"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Date</ion-label>
                        <ion-datetime-button datetime="malariaDate"></ion-datetime-button>
                        <ion-modal [keepContentsMounted]="true">
                          <ng-template>
                            <ion-datetime id="malariaDate" presentation="date" formControlName="date"></ion-datetime>
                          </ng-template>
                        </ion-modal>
                        <ion-note slot="error" *ngIf="malariaForm.get('date')?.invalid && malariaForm.get('date')?.touched">
                          Date is required.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Reporting Period</ion-label>
                        <ion-select formControlName="reporting_period" interface="popover">
                          <ion-select-option value="daily">Daily</ion-select-option>
                          <ion-select-option value="weekly">Weekly</ion-select-option>
                          <ion-select-option value="monthly">Monthly</ion-select-option>
                          <ion-select-option value="quarterly">Quarterly</ion-select-option>
                          <ion-select-option value="yearly">Yearly</ion-select-option>
                        </ion-select>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Data Source</ion-label>
                        <ion-input formControlName="data_source" type="text"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Suspected Cases</ion-label>
                        <ion-input formControlName="suspected_cases" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Tested Cases</ion-label>
                        <ion-input formControlName="tested_cases" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Confirmed Cases</ion-label>
                        <ion-input formControlName="confirmed_cases" type="number"></ion-input>
                        <ion-note slot="error" *ngIf="malariaForm.get('confirmed_cases')?.invalid && malariaForm.get('confirmed_cases')?.touched">
                          Confirmed Cases is required and must be a number.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Confirmed Cases (Pf)</ion-label>
                        <ion-input formControlName="confirmed_cases_pf" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Confirmed Cases (Pv)</ion-label>
                        <ion-input formControlName="confirmed_cases_pv" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Confirmed Cases (Pm)</ion-label>
                        <ion-input formControlName="confirmed_cases_pm" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Confirmed Cases (Po)</ion-label>
                        <ion-input formControlName="confirmed_cases_po" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Confirmed Cases (Pk)</ion-label>
                        <ion-input formControlName="confirmed_cases_pk" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Severe Cases</ion-label>
                        <ion-input formControlName="severe_cases" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Hospitalized Cases</ion-label>
                        <ion-input formControlName="hospitalized_cases" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Deaths</ion-label>
                        <ion-input formControlName="deaths" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Test Positivity Rate (%)</ion-label>
                        <ion-input formControlName="test_positivity_rate" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Case Fatality Rate (%)</ion-label>
                        <ion-input formControlName="case_fatality_rate" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Annual Parasite Index</ion-label>
                        <ion-input formControlName="annual_parasite_index" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Proportion Under 5 (%)</ion-label>
                        <ion-input formControlName="proportion_under5" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">RDT Positive</ion-label>
                        <ion-input formControlName="rdt_positive" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Microscopy Positive</ion-label>
                        <ion-input formControlName="microscopy_positive" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">PCR Positive</ion-label>
                        <ion-input formControlName="pcr_positive" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">ACT Treatment Courses</ion-label>
                        <ion-input formControlName="act_treatment_courses" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">CQ Treatment Courses</ion-label>
                        <ion-input formControlName="cq_treatment_courses" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Treatment Failure Cases</ion-label>
                        <ion-input formControlName="treatment_failure_cases" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">ITN Distributed</ion-label>
                        <ion-input formControlName="itn_distributed" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">ITN Usage Rate (%)</ion-label>
                        <ion-input formControlName="itn_usage_rate" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">IRS Coverage (%)</ion-label>
                        <ion-input formControlName="irs_coverage" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">IPTP Coverage (%)</ion-label>
                        <ion-input formControlName="iptp_coverage" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Seasonal Chemoprevention</ion-label>
                        <ion-input formControlName="seasonal_chemoprevention" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Larval Habitat Sites</ion-label>
                        <ion-input formControlName="larval_habitat_sites" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Breeding Sites Treated</ion-label>
                        <ion-input formControlName="breeding_sites_treated" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Artemisinin Resistance Suspected</ion-label>
                        <ion-input formControlName="artemisinin_resistance_suspected" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label>
                          <ion-label position="stacked">Insecticide Resistance Reported</ion-label>
                        </ion-label>
                        <ion-checkbox formControlName="insecticide_resistance_reported"></ion-checkbox>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Rainfall (mm)</ion-label>
                        <ion-input formControlName="rainfall_mm" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Temperature Avg (°C)</ion-label>
                        <ion-input formControlName="temperature_avg" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Humidity Avg (%)</ion-label>
                        <ion-input formControlName="humidity_avg" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Age Distribution (JSON)</ion-label>
                        <ion-textarea formControlName="age_distribution_json" rows="3" placeholder='e.g., {"under5": 100, "5-14": 200, "15-49": 300, "50plus": 50}'></ion-textarea>
                        <ion-note slot="error" *ngIf="malariaForm.get('age_distribution_json')?.errors?.['jsonInvalid']">
                          Invalid JSON format.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Gender Distribution (JSON)</ion-label>
                        <ion-textarea formControlName="gender_distribution_json" rows="3" placeholder='e.g., {"male": 1000, "female": 1000}'></ion-textarea>
                        <ion-note slot="error" *ngIf="malariaForm.get('gender_distribution_json')?.errors?.['jsonInvalid']">
                          Invalid JSON format.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Risk Group Distribution (JSON)</ion-label>
                        <ion-textarea formControlName="risk_group_distribution_json" rows="3" placeholder='e.g., {"pregnant": 50, "under5": 150, "travelers": 20}'></ion-textarea>
                        <ion-note slot="error" *ngIf="malariaForm.get('risk_group_distribution_json')?.errors?.['jsonInvalid']">
                          Invalid JSON format.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Parasite Species Distribution (JSON)</ion-label>
                        <ion-textarea formControlName="parasite_species_distribution_json" rows="3" placeholder='e.g., {"falciparum": 1500, "vivax": 400, "ovale": 50, "malariae": 50}'></ion-textarea>
                        <ion-note slot="error" *ngIf="malariaForm.get('parasite_species_distribution_json')?.errors?.['jsonInvalid']">
                          Invalid JSON format.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Data Completeness (%)</ion-label>
                        <ion-input formControlName="data_completeness" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label>
                          <ion-label position="stacked">Data Accuracy Flag</ion-label>
                        </ion-label>
                        <ion-checkbox formControlName="data_accuracy_flag"></ion-checkbox>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Reporting Officer</ion-label>
                        <ion-input formControlName="reporting_officer" type="text"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Verification Status</ion-label>
                        <ion-select formControlName="verification_status" interface="popover">
                          <ion-select-option value="pending">Pending</ion-select-option>
                          <ion-select-option value="verified">Verified</ion-select-option>
                          <ion-select-option value="rejected">Rejected</ion-select-option>
                        </ion-select>
                      </ion-item>

                      <ion-button expand="block" type="submit" [disabled]="malariaForm.invalid || isSubmittingMalaria" class="ion-margin-top">
                        {{ isSubmittingMalaria ? 'Submitting...' : 'Submit Malaria Data' }}
                      </ion-button>
                    </ion-list>
                  </form>
                </div>

                <!-- File Upload Section -->
                <ion-item-divider class="ion-margin-top">
                  <ion-label>Upload Data from File</ion-label>
                </ion-item-divider>

                <ion-list>
                  <ion-item>
                    <ion-label>Upload Type</ion-label>
                    <ion-select [(ngModel)]="selectedFileUploadType">
                      <ion-select-option value="malaria">Malaria Data</ion-select-option>
                      <ion-select-option value="diabetes">Diabetes Data</ion-select-option>
                    </ion-select>
                  </ion-item>

                  <ion-item>
                    <ion-label>File Format</ion-label>
                    <ion-select [(ngModel)]="fileFormat">
                      <ion-select-option value="csv">CSV</ion-select-option>
                      <ion-select-option value="json">JSON</ion-select-option>
                    </ion-select>
                  </ion-item>

                  <div class="ion-padding">
                    <ion-button expand="block" (click)="fileInput.click()">
                      <ion-icon name="cloud-upload-outline" slot="start"></ion-icon>
                      Select File
                    </ion-button>
                    <input #fileInput type="file" hidden (change)="onFileSelected($event)">
                  </div>

                  <div *ngIf="selectedFile" class="ion-padding">
                    <ion-item>
                      <ion-label>
                        <h2>Selected File</h2>
                        <p>{{ selectedFile.name }}</p>
                      </ion-label>
                      <ion-button fill="clear" slot="end" (click)="uploadFile()" [disabled]="isSubmittingFile">
                        {{ isSubmittingFile ? 'Uploading...' : 'Upload File' }}
                      </ion-button>
                    </ion-item>
                  </div>
                </ion-list>

              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 1rem 0;
    }
    ion-item {
      --padding-start: 0;
    }
    ion-segment {
      margin-bottom: 20px;
    }
    ion-item-divider {
      margin-top: 30px;
      margin-bottom: 15px;
      --background: var(--ion-color-light);
      --color: var(--ion-color-medium);
      font-size: 0.9em;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule]
})
export class DataUploadComponent implements OnInit {
  malariaForm: FormGroup;
  diabetesForm: FormGroup;

  selectedSegment: string = 'malaria';
  isSubmittingMalaria = false;
  selectedFileUploadType: 'malaria' | 'diabetes' = 'malaria';
  fileFormat: 'csv' | 'json' = 'csv';
  selectedFile: File | null = null;
  isSubmittingFile = false;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private toastController: ToastController
  ) {
    this.malariaForm = this.fb.group({
      country: ['Cameroon'], // Default to Cameroon
      region: ['', Validators.required],
      district: [''],
      health_facility: [''],
      date: ['', Validators.required],
      reporting_period: ['monthly'], // Default or initial value
      data_source: [''],

      suspected_cases: [null, [Validators.min(0)]],
      tested_cases: [null, [Validators.min(0)]],
      confirmed_cases: [null, [Validators.required, Validators.min(0)]],
      confirmed_cases_pf: [null, [Validators.min(0)]],
      confirmed_cases_pv: [null, [Validators.min(0)]],
      confirmed_cases_pm: [null, [Validators.min(0)]],
      confirmed_cases_po: [null, [Validators.min(0)]],
      confirmed_cases_pk: [null, [Validators.min(0)]],
      severe_cases: [null, [Validators.min(0)]],
      hospitalized_cases: [null, [Validators.min(0)]],
      deaths: [null, [Validators.min(0)]],

      test_positivity_rate: [null, [Validators.min(0), Validators.max(100)]],
      case_fatality_rate: [null, [Validators.min(0), Validators.max(100)]],
      annual_parasite_index: [null, [Validators.min(0)]],
      proportion_under5: [null, [Validators.min(0), Validators.max(100)]],

      rdt_positive: [null, [Validators.min(0)]],
      microscopy_positive: [null, [Validators.min(0)]],
      pcr_positive: [null, [Validators.min(0)]],

      act_treatment_courses: [null, [Validators.min(0)]],
      cq_treatment_courses: [null, [Validators.min(0)]],
      treatment_failure_cases: [null, [Validators.min(0)]],

      itn_distributed: [null, [Validators.min(0)]],
      itn_usage_rate: [null, [Validators.min(0), Validators.max(100)]],
      irs_coverage: [null, [Validators.min(0), Validators.max(100)]],
      iptp_coverage: [null, [Validators.min(0), Validators.max(100)]],
      seasonal_chemoprevention: [null, [Validators.min(0)]],

      larval_habitat_sites: [null, [Validators.min(0)]],
      breeding_sites_treated: [null, [Validators.min(0)]],

      artemisinin_resistance_suspected: [null, [Validators.min(0)]],
      insecticide_resistance_reported: [null],

      rainfall_mm: [null, [Validators.min(0)]],
      temperature_avg: [null],
      humidity_avg: [null, [Validators.min(0), Validators.max(100)]],

      age_distribution_json: ['', this.jsonValidator()],
      gender_distribution_json: ['', this.jsonValidator()],
      risk_group_distribution_json: ['', this.jsonValidator()],
      parasite_species_distribution_json: ['', this.jsonValidator()],

      data_completeness: [null, [Validators.min(0), Validators.max(100)]],
      data_accuracy_flag: [null],

      reporting_officer: [''],
      verification_status: ['pending'], // Default or initial value

      // Old fields (making them optional/null for now and will be removed from payload)
      total_cases: [null],
      active_cases: [null],
      recovered_cases: [null],
      incidence: [null],
      prevalence: [null],
      detection_rate: [null],
      hospitalization_rate: [null],
      mortality_rate: [null],
      treatment_adherence_rate: [null],
      preventive_measures_json: ['', this.jsonValidator()],
      community_awareness_level: [null],
      vector_control_json: ['', this.jsonValidator()],
      environmental_factors_json: ['', this.jsonValidator()],
    });

    this.diabetesForm = this.fb.group({
      region: ['', Validators.required],
      date: [null, Validators.required],
      total_cases: [null, [Validators.required, Validators.min(0)]],
      active_cases: [null, [Validators.min(0)]],
      recovered_cases: [null, [Validators.min(0)]],
      deaths: [null, [Validators.min(0)]],
      type1_cases: [null, [Validators.min(0)]],
      type2_cases: [null, [Validators.min(0)]],
      gestational_cases: [null, [Validators.min(0)]],
      hba1c_levels_json: ['', this.jsonValidator()],
      treatment_adherence_json: ['', this.jsonValidator()],
      complications_json: ['', this.jsonValidator()],
      risk_factors_json: ['', this.jsonValidator()],
      screening_data_json: ['', this.jsonValidator()],
      age_distribution_json: ['', this.jsonValidator()],
      gender_distribution_json: ['', this.jsonValidator()],
      geographic_distribution_json: ['', this.jsonValidator()],
    });
  }

  ngOnInit() { }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  jsonValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value === null || control.value.trim() === '') {
        return null; // Don't validate empty values
      }
      try {
        JSON.parse(control.value);
        return null; // Valid JSON
      } catch (e) {
        return { jsonInvalid: true }; // Invalid JSON
      }
    };
  }

  async onSubmitMalaria() {
    if (this.malariaForm.invalid) {
      this.presentToast('Please fill in all required fields and correct any invalid data.', 'danger');
      this.markAllAsTouched(this.malariaForm);
      return;
    }

    this.isSubmittingMalaria = true;
    try {
      const formValue = this.malariaForm.value;

      const payload: any = {
        country: formValue.country,
        region: formValue.region,
        district: formValue.district || null,
        health_facility: formValue.health_facility || null,
        date: formValue.date,
        reporting_period: formValue.reporting_period || null,
        data_source: formValue.data_source || null,
        suspected_cases: formValue.suspected_cases || null,
        tested_cases: formValue.tested_cases || null,
        confirmed_cases: formValue.confirmed_cases,
        confirmed_cases_pf: formValue.confirmed_cases_pf || null,
        confirmed_cases_pv: formValue.confirmed_cases_pv || null,
        confirmed_cases_pm: formValue.confirmed_cases_pm || null,
        confirmed_cases_po: formValue.confirmed_cases_po || null,
        confirmed_cases_pk: formValue.confirmed_cases_pk || null,
        severe_cases: formValue.severe_cases || null,
        hospitalized_cases: formValue.hospitalized_cases || null,
        deaths: formValue.deaths || null,
        test_positivity_rate: formValue.test_positivity_rate || null,
        case_fatality_rate: formValue.case_fatality_rate || null,
        annual_parasite_index: formValue.annual_parasite_index || null,
        proportion_under5: formValue.proportion_under5 || null,
        rdt_positive: formValue.rdt_positive || null,
        microscopy_positive: formValue.microscopy_positive || null,
        pcr_positive: formValue.pcr_positive || null,
        act_treatment_courses: formValue.act_treatment_courses || null,
        cq_treatment_courses: formValue.cq_treatment_courses || null,
        treatment_failure_cases: formValue.treatment_failure_cases || null,
        itn_distributed: formValue.itn_distributed || null,
        itn_usage_rate: formValue.itn_usage_rate || null,
        irs_coverage: formValue.irs_coverage || null,
        iptp_coverage: formValue.iptp_coverage || null,
        seasonal_chemoprevention: formValue.seasonal_chemoprevention || null,
        larval_habitat_sites: formValue.larval_habitat_sites || null,
        breeding_sites_treated: formValue.breeding_sites_treated || null,
        artemisinin_resistance_suspected: formValue.artemisinin_resistance_suspected || null,
        insecticide_resistance_reported: formValue.insecticide_resistance_reported || null,
        rainfall_mm: formValue.rainfall_mm || null,
        temperature_avg: formValue.temperature_avg || null,
        humidity_avg: formValue.humidity_avg || null,
        data_completeness: formValue.data_completeness || null,
        data_accuracy_flag: formValue.data_accuracy_flag || null,
        reporting_officer: formValue.reporting_officer || null,
        verification_status: formValue.verification_status || null,
      };

      // Handle JSON fields
      if (formValue.age_distribution_json) {
        try {
          payload.age_distribution = JSON.parse(formValue.age_distribution_json);
        } catch (e) {
          this.presentToast('Invalid JSON for Age Distribution.', 'danger');
          this.isSubmittingMalaria = false;
          return;
        }
      }
      if (formValue.gender_distribution_json) {
        try {
          payload.gender_distribution = JSON.parse(formValue.gender_distribution_json);
        } catch (e) {
          this.presentToast('Invalid JSON for Gender Distribution.', 'danger');
          this.isSubmittingMalaria = false;
          return;
        }
      }
      if (formValue.risk_group_distribution_json) {
        try {
          payload.risk_group_distribution = JSON.parse(formValue.risk_group_distribution_json);
        } catch (e) {
          this.presentToast('Invalid JSON for Risk Group Distribution.', 'danger');
          this.isSubmittingMalaria = false;
          return;
        }
      }
      if (formValue.parasite_species_distribution_json) {
        try {
          payload.parasite_species_distribution = JSON.parse(formValue.parasite_species_distribution_json);
        } catch (e) {
          this.presentToast('Invalid JSON for Parasite Species Distribution.', 'danger');
          this.isSubmittingMalaria = false;
          return;
        }
      }

      // Remove old JSON fields from payload that are now split into individual columns or are deprecated
      delete payload.preventive_measures_json;
      delete payload.vector_control_json;
      delete payload.environmental_factors_json;

      // Remove old numeric fields from payload that are now superseded
      delete payload.total_cases;
      delete payload.active_cases;
      delete payload.recovered_cases;
      delete payload.incidence;
      delete payload.prevalence;
      delete payload.detection_rate;
      delete payload.hospitalization_rate;
      delete payload.mortality_rate;
      delete payload.treatment_adherence_rate;
      delete payload.community_awareness_level;

      const { error } = await this.supabaseService.client
        .from('malaria_surveillance')
        .insert([payload]);

      if (error) {
        throw error;
      }

      this.presentToast('Malaria data uploaded successfully!', 'success');
      this.malariaForm.reset();
      this.malariaForm.patchValue({ country: 'Cameroon', reporting_period: 'monthly', verification_status: 'pending' });
    } catch (error: any) {
      console.error('Error uploading malaria data:', error);
      this.presentToast(`Error uploading data: ${error.message}`, 'danger');
    } finally {
      this.isSubmittingMalaria = false;
    }
  }

  async onSubmitDiabetes() {
    if (this.diabetesForm.invalid) {
      this.presentToast('Please fill in all required fields and correct any invalid data for Diabetes.', 'danger');
      this.markAllAsTouched(this.diabetesForm);
      return;
    }

    this.isSubmittingMalaria = true; // Reusing for diabetes submission, consider renaming
    try {
      const formData = this.diabetesForm.value;
      const diabetesData = {
        disease_type: 'diabetes',
        region: formData.region,
        date: new Date(formData.date).toISOString(),
        total_cases: formData.total_cases,
        active_cases: formData.active_cases || 0,
        recovered_cases: formData.recovered_cases || 0,
        deaths: formData.deaths || 0,
        type1_cases: formData.type1_cases || 0,
        type2_cases: formData.type2_cases || 0,
        gestational_cases: formData.gestational_cases || 0,
        hba1c_levels: formData.hba1c_levels_json ? JSON.parse(formData.hba1c_levels_json) : {},
        treatment_adherence: formData.treatment_adherence_json ? JSON.parse(formData.treatment_adherence_json) : {},
        complications: formData.complications_json ? JSON.parse(formData.complications_json) : {},
        risk_factors: formData.risk_factors_json ? JSON.parse(formData.risk_factors_json) : {},
        screening_data: formData.screening_data_json ? JSON.parse(formData.screening_data_json) : {},
        age_distribution: formData.age_distribution_json ? JSON.parse(formData.age_distribution_json) : {},
        gender_distribution: formData.gender_distribution_json ? JSON.parse(formData.gender_distribution_json) : {},
        geographic_distribution: formData.geographic_distribution_json ? JSON.parse(formData.geographic_distribution_json) : {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await this.supabaseService.client
        .from('diabetes_data')
        .insert([diabetesData]);

      if (error) {
        throw error;
      }

      this.presentToast('Diabetes data uploaded successfully!', 'success');
      this.diabetesForm.reset();
    } catch (error: any) {
      console.error('Error uploading diabetes data:', error);
      this.presentToast(`Error uploading data: ${error.message}`, 'danger');
    } finally {
      this.isSubmittingMalaria = false; // Resetting this specific flag
    }
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFile = element.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  async uploadFile() {
    if (!this.selectedFile) {
      this.presentToast('No file selected.', 'danger');
      return;
    }

    this.isSubmittingFile = true;
    try {
      const fileContent = await this.selectedFile.text();
      let parsedData: any[] = [];

      if (this.fileFormat === 'csv') {
        parsedData = this.parseCSV(fileContent);
      } else if (this.fileFormat === 'json') {
        parsedData = this.parseJSON(fileContent);
      }

      if (parsedData.length === 0) {
        this.presentToast('No data parsed from file. Please check file format and content.', 'warning');
        this.isSubmittingFile = false;
        return;
      }

      const table = this.selectedFileUploadType === 'malaria' ? 'malaria_surveillance' : 'diabetes_data';

      // Transform data to match the new schema for malaria, if applicable
      const dataToUpload = parsedData.map(item => {
        if (this.selectedFileUploadType === 'malaria') {
          return {
            country: item.country || 'Cameroon',
            region: item.region,
            district: item.district || null,
            health_facility: item.health_facility || null,
            date: item.date, // Assuming YYYY-MM-DD or parsable format
            reporting_period: item.reporting_period || 'monthly',
            data_source: item.data_source || null,

            suspected_cases: item.suspected_cases || null,
            tested_cases: item.tested_cases || null,
            confirmed_cases: item.confirmed_cases || 0,
            confirmed_cases_pf: item.confirmed_cases_pf || null,
            confirmed_cases_pv: item.confirmed_cases_pv || null,
            confirmed_cases_pm: item.confirmed_cases_pm || null,
            confirmed_cases_po: item.confirmed_cases_po || null,
            confirmed_cases_pk: item.confirmed_cases_pk || null,
            severe_cases: item.severe_cases || null,
            hospitalized_cases: item.hospitalized_cases || null,
            deaths: item.deaths || null,

            test_positivity_rate: item.test_positivity_rate || null,
            case_fatality_rate: item.case_fatality_rate || null,
            annual_parasite_index: item.annual_parasite_index || null,
            proportion_under5: item.proportion_under5 || null,

            rdt_positive: item.rdt_positive || null,
            microscopy_positive: item.microscopy_positive || null,
            pcr_positive: item.pcr_positive || null,

            act_treatment_courses: item.act_treatment_courses || null,
            cq_treatment_courses: item.cq_treatment_courses || null,
            treatment_failure_cases: item.treatment_failure_cases || null,

            itn_distributed: item.itn_distributed || null,
            itn_usage_rate: item.itn_usage_rate || null,
            irs_coverage: item.irs_coverage || null,
            iptp_coverage: item.iptp_coverage || null,
            seasonal_chemoprevention: item.seasonal_chemoprevention || null,

            larval_habitat_sites: item.larval_habitat_sites || null,
            breeding_sites_treated: item.breeding_sites_treated || null,

            artemisinin_resistance_suspected: item.artemisinin_resistance_suspected || null,
            insecticide_resistance_reported: item.insecticide_resistance_reported || null,

            rainfall_mm: item.rainfall_mm || null,
            temperature_avg: item.temperature_avg || null,
            humidity_avg: item.humidity_avg || null,

            age_distribution: item.age_distribution ? JSON.parse(item.age_distribution) : null,
            gender_distribution: item.gender_distribution ? JSON.parse(item.gender_distribution) : null,
            risk_group_distribution: item.risk_group_distribution ? JSON.parse(item.risk_group_distribution) : null,
            parasite_species_distribution: item.parasite_species_distribution ? JSON.parse(item.parasite_species_distribution) : null,

            data_completeness: item.data_completeness || null,
            data_accuracy_flag: item.data_accuracy_flag || null,
            reporting_officer: item.reporting_officer || null,
            verification_status: item.verification_status || 'pending',
          };
        }
        return item; // For diabetes data, pass as is (assuming current schema alignment)
      });

      const { error } = await this.supabaseService.client
        .from(table)
        .insert(dataToUpload);

      if (error) {
        throw error;
      }

      this.presentToast('File uploaded successfully!', 'success');
      this.selectedFile = null;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      this.presentToast(`Error uploading file: ${error.message}`, 'danger');
    } finally {
      this.isSubmittingFile = false;
    }
  }

  private parseCSV(csvString: string): any[] {
    const lines = csvString.split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      if (currentLine === '') continue;

      const values = currentLine.split(',');
      const row: any = {};
      for (let j = 0; j < headers.length; j++) {
        let value: any = values[j] ? values[j].trim() : null;
        // Attempt to convert to number if possible
        if (!isNaN(Number(value)) && value !== '') {
          value = Number(value);
        } else if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        }
        row[headers[j]] = value;
      }
      data.push(row);
    }
    return data;
  }

  private parseJSON(jsonString: string): any[] {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        // If it's a single JSON object, wrap it in an array
        return [parsed];
      }
    } catch (e: any) {
      this.presentToast(`Invalid JSON file: ${e.message}`, 'danger');
      return [];
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
    });
    toast.present();
  }

  markAllAsTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      } else if (control) {
        control.markAsTouched();
      }
    });
  }
} 