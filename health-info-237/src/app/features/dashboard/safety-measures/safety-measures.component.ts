import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-safety-measures',
  template: `
    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Safety Measures Dashboard</ion-card-title>
                <ion-card-subtitle>Monitor and manage public health safety measures during outbreaks.</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <h2>Malaria Outbreak Safety Measures</h2>
                <ul>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Use Insecticide-Treated Nets (ITNs):</strong> Sleep under long-lasting insecticide-treated nets every night.</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Indoor Residual Spraying (IRS):</strong> Ensure your home is sprayed with approved insecticides by health authorities.</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Eliminate Mosquito Breeding Sites:</strong> Remove stagnant water from around your home (e.g., old tires, flower pots, clogged gutters).</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Wear Protective Clothing:</strong> Cover up with long-sleeved shirts and long pants, especially from dusk till dawn.</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Use Insect Repellents:</strong> Apply mosquito repellents containing DEET, picaridin, or oil of lemon eucalyptus to exposed skin.</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Seek Early Diagnosis and Treatment:</strong> If you suspect malaria, get tested and treated promptly with antimalarial drugs.</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Community Engagement:</strong> Participate in community-led malaria control programs and awareness campaigns.</li>
                </ul>

                <h2 class="diabetes-measures-header">Diabetes Outbreak Safety Measures</h2>
                <p>During public health emergencies or crises, managing diabetes requires additional precautions. Maintain strict control to minimize risks.</p>
                <ul>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Ensure Medication Supply:</strong> Keep at least a 2-week to 1-month supply of all diabetes medications, insulin, and supplies (needles, syringes, test strips).</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Monitor Blood Glucose Regularly:</strong> Test blood sugar frequently, as stress or changes in routine can affect levels.</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Stay Hydrated:</strong> Drink plenty of water to avoid dehydration, which can impact blood sugar.</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Maintain a Healthy Diet:</strong> Stick to your meal plan as much as possible, even in challenging circumstances.</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Foot Care:</strong> Inspect feet daily for cuts, blisters, or infections, as these can worsen rapidly with diabetes.</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Know Emergency Contacts:</strong> Have contact information for your healthcare provider and emergency services readily available.</li>
                  <li><ion-icon name="checkmark-circle"></ion-icon> <strong>Medical Alert Identification:</strong> Wear medical alert identification to inform others of your condition in an emergency.</li>
                </ul>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 1.5rem 0;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background-color: #ffffff;
    }
    ion-card-header {
      padding-bottom: 10px;
    }
    ion-card-title {
      font-size: 1.8em;
      font-weight: 700;
      color: #2c3e50; /* Darker blue-grey for main titles */
      margin-bottom: 5px;
    }
    ion-card-subtitle {
      font-size: 1.1em;
      color: #7f8c8d; /* Muted grey for subtitles */
    }
    h2 {
      color: #34495e; /* Slightly lighter dark blue-grey for section headers */
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 1.6em;
      font-weight: 600;
      border-bottom: 2px solid #ecf0f1; /* Light grey border for separation */
      padding-bottom: 8px;
    }
    ul {
      list-style: none;
      padding: 0;
      margin-bottom: 25px;
    }
    li {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      color: #4a4a4a;
      font-size: 1.1em;
      line-height: 1.6;
    }
    ion-icon {
      color: #27ae60; /* A vibrant green for checkmarks */
      margin-right: 12px;
      font-size: 1.4em;
      min-width: 20px; /* Ensure icon has consistent spacing */
      margin-top: 2px; 
    }
    strong {
      color: #34495e; /* Emphasize bold text */
    }
    .diabetes-measures-header {
      border-top: 1px solid #ddd;
      padding-top: 25px;
      margin-top: 35px;
    }
    p {
      margin-bottom: 20px;
      color: #555;
      font-size: 1.05em;
      line-height: 1.7;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SafetyMeasuresComponent {
  constructor() {}
} 