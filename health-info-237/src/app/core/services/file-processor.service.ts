import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ProcessedData {
  data: any[];
  headers: string[];
  errors: ValidationError[];
  isValid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FileProcessorService {
  private readonly requiredFields: { [key: string]: string[] } = {
    disease: ['date_reported', 'cases', 'location', 'disease_type', 'status'],
    safety: ['date_implemented', 'measure_type', 'location', 'description', 'status'],
    vaccination: ['date_administered', 'vaccine_type', 'location', 'doses', 'recipient_age']
  };

  private readonly fieldValidators: { [key: string]: (value: any) => boolean } = {
    date_reported: (value) => this.isValidDate(value),
    date_implemented: (value) => this.isValidDate(value),
    date_administered: (value) => this.isValidDate(value),
    cases: (value) => this.isPositiveNumber(value),
    doses: (value) => this.isPositiveNumber(value),
    recipient_age: (value) => this.isPositiveNumber(value) && value <= 120,
    status: (value) => ['active', 'resolved', 'pending'].includes(value?.toLowerCase()),
    disease_type: (value) => ['malaria', 'diabetes', 'hypertension', 'other'].includes(value?.toLowerCase()),
    measure_type: (value) => ['prevention', 'treatment', 'awareness', 'other'].includes(value?.toLowerCase()),
    vaccine_type: (value) => ['covid-19', 'malaria', 'yellow fever', 'other'].includes(value?.toLowerCase())
  };

  async processFile(file: File, dataType: string): Promise<ProcessedData> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let rawData: any[] = [];
    let headers: string[] = [];

    try {
      if (fileExtension === 'csv') {
        const result = await this.parseCSV(file);
        rawData = result.data;
        headers = result.headers;
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        const result = await this.parseExcel(file);
        rawData = result.data;
        headers = result.headers;
      } else {
        throw new Error('Unsupported file format');
      }

      // Validate headers
      const validationResult = this.validateData(rawData, headers, dataType);
      return {
        data: validationResult.isValid ? rawData : [],
        headers,
        errors: validationResult.errors,
        isValid: validationResult.isValid
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  private async parseCSV(file: File): Promise<{ data: any[]; headers: string[] }> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('Error parsing CSV file'));
            return;
          }
          resolve({
            data: results.data,
            headers: results.meta.fields || []
          });
        },
        error: (error) => reject(error)
      });
    });
  }

  private async parseExcel(file: File): Promise<{ data: any[]; headers: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          const headers = Object.keys(jsonData[0] || {});
          resolve({ data: jsonData, headers });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  private validateData(data: any[], headers: string[], dataType: string): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const requiredFields = this.requiredFields[dataType] || [];

    // Check for required fields
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      errors.push({
        row: 0,
        field: 'headers',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
      return { isValid: false, errors };
    }

    // Validate each row
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        const value = row[field];
        const validator = this.fieldValidators[field];

        if (value === undefined || value === null || value === '') {
          errors.push({
            row: index + 1,
            field,
            message: `${field} is required`
          });
        } else if (validator && !validator(value)) {
          errors.push({
            row: index + 1,
            field,
            message: `Invalid value for ${field}`
          });
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidDate(value: any): boolean {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }

  private isPositiveNumber(value: any): boolean {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  }

  generateTemplate(dataType: string): string {
    const requiredFields = this.requiredFields[dataType] || [];
    const headers = requiredFields.join(',');
    const exampleRow = this.getExampleRow(dataType);
    return `${headers}\n${exampleRow}`;
  }

  private getExampleRow(dataType: string): string {
    switch (dataType) {
      case 'disease':
        return '2024-03-01,10,Buea,malaria,active';
      case 'safety':
        return '2024-03-01,prevention,Buea,Distribution of mosquito nets,active';
      case 'vaccination':
        return '2024-03-01,covid-19,Buea,2,45';
      default:
        return '';
    }
  }
} 