import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/core/services/supabase.service';
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
                        <ion-label position="floating">Region</ion-label>
                        <ion-input formControlName="region" type="text"></ion-input>
                        <ion-note slot="error" *ngIf="malariaForm.get('region')?.invalid && malariaForm.get('region')?.touched">
                          Region is required.
                        </ion-note>
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
                        <ion-label position="floating">Total Cases</ion-label>
                        <ion-input formControlName="total_cases" type="number"></ion-input>
                        <ion-note slot="error" *ngIf="malariaForm.get('total_cases')?.invalid && malariaForm.get('total_cases')?.touched">
                          Total Cases is required and must be a number.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Active Cases</ion-label>
                        <ion-input formControlName="active_cases" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Recovered Cases</ion-label>
                        <ion-input formControlName="recovered_cases" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Deaths</ion-label>
                        <ion-input formControlName="deaths" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Incidence</ion-label>
                        <ion-input formControlName="incidence" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Prevalence</ion-label>
                        <ion-input formControlName="prevalence" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Age Distribution (JSON)</ion-label>
                        <ion-textarea formControlName="age_distribution_json" rows="3" placeholder='e.g., {"0-4": 100, "5-14": 200, "15-24": 300}'></ion-textarea>
                        <ion-note slot="error" *ngIf="malariaForm.get('age_distribution_json')?.errors?.['jsonInvalid']">
                          Invalid JSON format.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Geographic Distribution (JSON)</ion-label>
                        <ion-textarea formControlName="geographic_distribution_json" rows="3" placeholder='e.g., {"North": 50, "South": 70, "East": 30}'></ion-textarea>
                        <ion-note slot="error" *ngIf="malariaForm.get('geographic_distribution_json')?.errors?.['jsonInvalid']">
                          Invalid JSON format.
                        </ion-note>
                      </ion-item>

                      <ion-button expand="block" type="submit" [disabled]="malariaForm.invalid || isSubmittingMalaria" class="ion-margin-top">
                        {{ isSubmittingMalaria ? 'Submitting...' : 'Submit Malaria Data' }}
                      </ion-button>
                    </ion-list>
                  </form>
                </div>

                <div *ngIf="selectedSegment === 'diabetes'">
                  <form [formGroup]="diabetesForm" (ngSubmit)="onSubmitDiabetes()">
                    <ion-list>
                      <ion-item>
                        <ion-label position="floating">Region</ion-label>
                        <ion-input formControlName="region" type="text"></ion-input>
                        <ion-note slot="error" *ngIf="diabetesForm.get('region')?.invalid && diabetesForm.get('region')?.touched">
                          Region is required.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Date</ion-label>
                        <ion-datetime-button datetime="diabetesDate"></ion-datetime-button>
                        <ion-modal [keepContentsMounted]="true">
                          <ng-template>
                            <ion-datetime id="diabetesDate" presentation="date" formControlName="date"></ion-datetime>
                          </ng-template>
                        </ion-modal>
                        <ion-note slot="error" *ngIf="diabetesForm.get('date')?.invalid && diabetesForm.get('date')?.touched">
                          Date is required.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Total Cases</ion-label>
                        <ion-input formControlName="total_cases" type="number"></ion-input>
                        <ion-note slot="error" *ngIf="diabetesForm.get('total_cases')?.invalid && diabetesForm.get('total_cases')?.touched">
                          Total Cases is required and must be a number.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Active Cases</ion-label>
                        <ion-input formControlName="active_cases" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Recovered Cases</ion-label>
                        <ion-input formControlName="recovered_cases" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Deaths</ion-label>
                        <ion-input formControlName="deaths" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Type 1 Cases</ion-label>
                        <ion-input formControlName="type1" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Type 2 Cases</ion-label>
                        <ion-input formControlName="type2" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Gestational Cases</ion-label>
                        <ion-input formControlName="gestational" type="number"></ion-input>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">HbA1c Levels (JSON)</ion-label>
                        <ion-textarea formControlName="hba1c_levels_json" rows="3" placeholder='e.g., {"normal": 50, "prediabetes": 30, "diabetes": 20}'></ion-textarea>
                        <ion-note slot="error" *ngIf="diabetesForm.get('hba1c_levels_json')?.errors?.['jsonInvalid']">
                          Invalid JSON format.
                        </ion-note>
                      </ion-item>

                      <ion-item>
                        <ion-label position="floating">Risk Factors (JSON)</ion-label>
                        <ion-textarea formControlName="risk_factors_json" rows="3" placeholder='e.g., {"obesity": 40, "hypertension": 10, "smoking": 5}'></ion-textarea>
                        <ion-note slot="error" *ngIf="diabetesForm.get('risk_factors_json')?.errors?.['jsonInvalid']">
                          Invalid JSON format.
                        </ion-note>
                      </ion-item>

                      <ion-button expand="block" type="submit" [disabled]="diabetesForm.invalid || isSubmittingDiabetes" class="ion-margin-top">
                        {{ isSubmittingDiabetes ? 'Submitting...' : 'Submit Diabetes Data' }}
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
                      <!-- For Excel, advanced client-side parsing is needed, or server-side. -->
                      <!-- <ion-select-option value="excel">Excel</ion-select-option> -->
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
  selectedSegment: string = 'malaria'; // Default to malaria form
  isSubmittingMalaria = false;
  isSubmittingDiabetes = false;

  // For file upload
  selectedFileUploadType: 'malaria' | 'diabetes' = 'malaria'; // Default file upload type
  fileFormat: 'csv' | 'json' | 'excel' = 'csv'; // Default file format
  selectedFile: File | null = null;
  isSubmittingFile = false;


  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private toastController: ToastController
  ) {
    this.malariaForm = this.fb.group({
      region: ['', Validators.required],
      date: [null, Validators.required],
      total_cases: [null, [Validators.required, Validators.min(0)]],
      active_cases: [null, [Validators.min(0)]],
      recovered_cases: [null, [Validators.min(0)]],
      deaths: [null, [Validators.min(0)]],
      incidence: [null, [Validators.min(0)]],
      prevalence: [null, [Validators.min(0)]],
      age_distribution_json: ['', this.jsonValidator()], // Custom validator for JSON
      geographic_distribution_json: ['', this.jsonValidator()], // Custom validator for JSON
      // Add other malaria specific fields as needed
    });

    this.diabetesForm = this.fb.group({
      region: ['', Validators.required],
      date: [null, Validators.required],
      total_cases: [null, [Validators.required, Validators.min(0)]],
      active_cases: [null, [Validators.min(0)]],
      recovered_cases: [null, [Validators.min(0)]],
      deaths: [null, [Validators.min(0)]],
      type1: [null, [Validators.min(0)]],
      type2: [null, [Validators.min(0)]],
      gestational: [null, [Validators.min(0)]],
      hba1c_levels_json: ['', this.jsonValidator()], // Custom validator for JSON
      risk_factors_json: ['', this.jsonValidator()], // Custom validator for JSON
      // Add other diabetes specific fields as needed
    });
  }

  ngOnInit() {
    // Initial console logs for debugging
    console.log('DataUploadComponent: Malaria form initialized:', this.malariaForm.value);
    console.log('DataUploadComponent: Diabetes form initialized:', this.diabetesForm.value);
  }

  // Method to handle segment changes (replaces ngModel for ion-segment)
  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  // Custom JSON validator
  jsonValidator() {
    return (control: { value: string; }) => {
      if (control.value === null || control.value === '') {
        return null; // Empty field is valid (optional)
      }
      try {
        JSON.parse(control.value);
      } catch (e) {
        return { jsonInvalid: true };
      }
      return null;
    };
  }

  async onSubmitMalaria() {
    this.isSubmittingMalaria = true;
    if (this.malariaForm.invalid) {
      this.malariaForm.markAllAsTouched();
      this.presentToast('Please fill in all required fields and correct JSON formats for Malaria data.', 'danger');
      this.isSubmittingMalaria = false;
      return;
    }

    try {
      const formData = this.malariaForm.value;
      const malariaData = {
        disease_type: 'malaria',
        region: formData.region,
        date: new Date(formData.date).toISOString(),
        total_cases: formData.total_cases,
        active_cases: formData.active_cases || 0,
        recovered_cases: formData.recovered_cases || 0,
        deaths: formData.deaths || 0,
        incidence: formData.incidence || 0,
        prevalence: formData.prevalence || 0,
        // Parse JSON fields
        age_distribution: formData.age_distribution_json ? JSON.parse(formData.age_distribution_json) : {},
        geographic_distribution: formData.geographic_distribution_json ? JSON.parse(formData.geographic_distribution_json) : {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Call the Supabase service to upload the data.
      // Note: The `uploadData` method in SupabaseService expects an array of objects.
      const { error } = await this.supabaseService.uploadData('malaria', [malariaData]);

      if (error) {
        throw error;
      }

      this.presentToast('Malaria data uploaded successfully!', 'success');
      this.malariaForm.reset();
      this.malariaForm.markAsUntouched(); // Clear touched state after reset
    } catch (error: any) {
      console.error('Error uploading malaria data:', error);
      this.presentToast(`Failed to upload malaria data: ${error.message || 'Unknown error'}`, 'danger');
    } finally {
      this.isSubmittingMalaria = false;
    }
  }

  async onSubmitDiabetes() {
    this.isSubmittingDiabetes = true;
    if (this.diabetesForm.invalid) {
      this.diabetesForm.markAllAsTouched();
      this.presentToast('Please fill in all required fields and correct JSON formats for Diabetes data.', 'danger');
      this.isSubmittingDiabetes = false;
      return;
    }

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
        type1: formData.type1 || 0,
        type2: formData.type2 || 0,
        gestational: formData.gestational || 0,
        // Parse JSON fields
        hba1c_levels: formData.hba1c_levels_json ? JSON.parse(formData.hba1c_levels_json) : {},
        risk_factors: formData.risk_factors_json ? JSON.parse(formData.risk_factors_json) : {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Call the Supabase service to upload the data.
      // Note: The `uploadData` method in SupabaseService expects an array of objects.
      const { error } = await this.supabaseService.uploadData('diabetes', [diabetesData]);

      if (error) {
        throw error;
      }

      this.presentToast('Diabetes data uploaded successfully!', 'success');
      this.diabetesForm.reset();
      this.diabetesForm.markAsUntouched(); // Clear touched state after reset
    } catch (error: any) {
      console.error('Error uploading diabetes data:', error);
      this.presentToast(`Failed to upload diabetes data: ${error.message || 'Unknown error'}`, 'danger');
    } finally {
      this.isSubmittingDiabetes = false;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async uploadFile() {
    if (!this.selectedFile) {
      this.presentToast('No file selected.', 'warning');
      return;
    }

    this.isSubmittingFile = true;

    try {
      let parsedData: any[] = [];

      const fileContent = await this.selectedFile.text();

      if (this.fileFormat === 'csv') {
        parsedData = this.parseCSV(fileContent);
      } else if (this.fileFormat === 'json') {
        parsedData = this.parseJSON(fileContent);
      } else if (this.fileFormat === 'excel') {
        // TODO: Implement Excel parsing (typically requires a library like 'xlsx'
        // which might be better suited for a server-side function or a more
        // complex client-side setup with a dedicated library).
        this.presentToast('Excel file upload is not yet implemented on the client-side.', 'warning');
        this.isSubmittingFile = false;
        return;
      }

      if (!parsedData || parsedData.length === 0) {
        this.presentToast('No valid data found in the file.', 'danger');
        this.isSubmittingFile = false;
        return;
      }

      // Add common required fields if missing and ensure date format
      parsedData = parsedData.map(item => ({
        ...item,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(), // Ensure date is ISO string
        // Default numbers to 0 if not present for required number fields
        total_cases: item.total_cases || 0,
        active_cases: item.active_cases || 0,
        recovered_cases: item.recovered_cases || 0,
        deaths: item.deaths || 0,
        // For JSON fields, ensure they are objects even if empty in CSV
        age_distribution: typeof item.age_distribution === 'string' && item.age_distribution ? JSON.parse(item.age_distribution) : (item.age_distribution || {}),
        geographic_distribution: typeof item.geographic_distribution === 'string' && item.geographic_distribution ? JSON.parse(item.geographic_distribution) : (item.geographic_distribution || {}),
        hba1c_levels: typeof item.hba1c_levels === 'string' && item.hba1c_levels ? JSON.parse(item.hba1c_levels) : (item.hba1c_levels || {}),
        risk_factors: typeof item.risk_factors === 'string' && item.risk_factors ? JSON.parse(item.risk_factors) : (item.risk_factors || {}),
      }));


      const { error } = await this.supabaseService.uploadData(this.selectedFileUploadType, parsedData);

      if (error) {
        throw error;
      }

      this.presentToast(`${this.selectedFileUploadType} data uploaded successfully!`, 'success');
      this.selectedFile = null; // Clear selected file after successful upload
    } catch (error: any) {
      console.error('Error uploading file data:', error);
      this.presentToast(`Failed to upload file data: ${error.message || 'Unknown error'}. Check console for details.`, 'danger');
    } finally {
      this.isSubmittingFile = false;
    }
  }

  private parseCSV(csvString: string): any[] {
    const lines = csvString.split('\\n').filter(line => line.trim() !== ''); // Use \\n for newline due to template string
    if (lines.length < 2) {
      console.warn('CSV string has less than 2 lines (header + data).');
      return [];
    }
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim());
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i + 1} due to mismatch in column count:`, lines[i]);
        continue;
      }
      let row: any = {};
      headers.forEach((header, index) => {
        let value: any = values[index];
        // Attempt to convert to number if possible
        if (!isNaN(Number(value)) && value.trim() !== '') {
          value = Number(value);
        }
        row[header] = value;
      });
      data.push(row);
    }
    return data;
  }

  private parseJSON(jsonString: string): any[] {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // If it's a single object, wrap it in an array
        return [parsed];
      }
      console.error('JSON is not an array or a single object:', parsed);
      return [];
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    toast.present();
  }
} 