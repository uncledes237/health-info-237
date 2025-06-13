import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, catchError, throwError, from } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { DiseaseData } from '../models/disease-data.model';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { ErrorReportingService } from './error-reporting.service';

@Injectable({
  providedIn: 'root'
})
export class DiseaseDataService {
  private malariaData$ = new BehaviorSubject<DiseaseData[]>([]);
  private diabetesData$ = new BehaviorSubject<DiseaseData[]>([]);
  private selectedRegion$ = new BehaviorSubject<string>('Southwest');

  // Expose observables as readonly
  readonly malariaData = this.malariaData$.asObservable();
  readonly diabetesData = this.diabetesData$.asObservable();
  readonly selectedRegion = this.selectedRegion$.asObservable();

  constructor(
    private supabase: SupabaseService,
    private errorReporting: ErrorReportingService
  ) {
    this.loadInitialData();
  }

  private async loadInitialData() {
    try {
      await Promise.all([
        this.loadMalariaData(),
        this.loadDiabetesData()
      ]);
    } catch (error) {
      this.errorReporting.captureError(error as Error, { context: 'loadInitialData' });
    }
  }

  private async loadMalariaData() {
    try {
      const { data, error } = await this.supabase.client
        .from('malaria_data')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      const transformedData = data.map(item => ({
        ...item,
        disease_type: 'malaria' as const,
        date: new Date(item.date),
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
        total: item.total_cases,
        active: item.active_cases,
        recovered: item.recovered_cases
      }));

      this.malariaData$.next(transformedData);
    } catch (error) {
      this.errorReporting.captureError(error as Error, { context: 'loadMalariaData' });
      throw error;
    }
  }

  private async loadDiabetesData() {
    try {
      const { data, error } = await this.supabase.client
        .from('diabetes_data')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      const transformedData = data.map(item => ({
        ...item,
        disease_type: 'diabetes' as const,
        date: new Date(item.date),
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
        total: item.total_cases,
        active: item.active_cases,
        recovered: item.recovered_cases,
        type1: item.type1_cases,
        type2: item.type2_cases,
        gestational: item.gestational_cases
      }));

      this.diabetesData$.next(transformedData);
    } catch (error) {
      this.errorReporting.captureError(error as Error, { context: 'loadDiabetesData' });
      throw error;
    }
  }

  getMalariaStats(): Observable<DiseaseData> {
    return from(this.supabase.client
      .from('malaria_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single())
      .pipe(
        map((response: PostgrestSingleResponse<any>) => {
          if (response.error) throw response.error;
          const data = response.data;
          return {
            ...data,
            disease_type: 'malaria' as const,
            date: new Date(data.date),
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
            total: data.total_cases,
            active: data.active_cases,
            recovered: data.recovered_cases
          };
        }),
        catchError(error => {
          this.errorReporting.captureError(error as Error, { context: 'getMalariaStats' });
          return throwError(() => error);
        })
      );
  }

  getDiabetesStats(): Observable<DiseaseData> {
    return from(this.supabase.client
      .from('diabetes_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single())
      .pipe(
        map((response: PostgrestSingleResponse<any>) => {
          if (response.error) throw response.error;
          const data = response.data;
          return {
            ...data,
            disease_type: 'diabetes' as const,
            date: new Date(data.date),
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
            total: data.total_cases,
            active: data.active_cases,
            recovered: data.recovered_cases,
            type1: data.type1_cases,
            type2: data.type2_cases,
            gestational: data.gestational_cases
          };
        }),
        catchError(error => {
          this.errorReporting.captureError(error as Error, { context: 'getDiabetesStats' });
          return throwError(() => error);
        })
      );
  }

  getTrendData(diseaseType: 'malaria' | 'diabetes'): Observable<any> {
    const table = diseaseType === 'malaria' ? 'malaria_data' : 'diabetes_data';
    return from(this.supabase.client
      .from(table)
      .select('date, total_cases, active_cases, recovered_cases, deaths')
      .order('date', { ascending: true })
      .limit(30))
      .pipe(
        map((response: PostgrestSingleResponse<any[]>) => {
          if (response.error) throw response.error;
          return {
            labels: response.data.map(d => new Date(d.date).toLocaleDateString()),
            datasets: [
              {
                label: 'Total Cases',
                data: response.data.map(d => d.total_cases),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              },
              {
                label: 'Active Cases',
                data: response.data.map(d => d.active_cases),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
              },
              {
                label: 'Recovered Cases',
                data: response.data.map(d => d.recovered_cases),
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1
              }
            ]
          };
        }),
        catchError(error => {
          this.errorReporting.captureError(error as Error, { context: 'getTrendData', diseaseType });
          return throwError(() => error);
        })
      );
  }

  getMalariaCases(): Observable<any[]> {
    return from(this.supabase.client
      .from('malaria_cases')
      .select('*')
      .eq('region', this.selectedRegion$.value)
      .order('case_date', { ascending: false }))
      .pipe(
        map((response: PostgrestSingleResponse<any[]>) => {
          if (response.error) throw response.error;
          return response.data;
        }),
        catchError(error => {
          this.errorReporting.captureError(error as Error, { context: 'getMalariaCases' });
          return throwError(() => error);
        })
      );
  }

  getDiabetesCases(): Observable<any[]> {
    return from(this.supabase.client
      .from('diabetes_cases')
      .select('*')
      .eq('region', this.selectedRegion$.value)
      .order('case_date', { ascending: false }))
      .pipe(
        map((response: PostgrestSingleResponse<any[]>) => {
          if (response.error) throw response.error;
          return response.data;
        }),
        catchError(error => {
          this.errorReporting.captureError(error as Error, { context: 'getDiabetesCases' });
          return throwError(() => error);
        })
      );
  }

  updateSelectedRegion(region: string) {
    this.selectedRegion$.next(region);
  }

  async getDiseaseReportData(diseaseType: 'malaria' | 'diabetes', dateRange?: { start: Date; end: Date }): Promise<{ data: any[] | null; error: any }> {
    const table = diseaseType === 'malaria' ? 'malaria_data' : 'diabetes_data';
    let query = this.supabase.client
      .from(table)
      .select('*')
      .order('date', { ascending: true });

    if (dateRange) {
      query = query
        .gte('date', dateRange.start.toISOString())
        .lte('date', dateRange.end.toISOString());
    }

    return query;
  }
} 