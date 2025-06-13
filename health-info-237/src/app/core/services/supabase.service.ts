import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { UserProfile } from './auth.service';
import { DiseaseData } from '../models/disease-data.model';

interface TimeRange {
  start: Date;
  end: Date;
}

interface SystemMetrics {
  activeUsers: number;
  totalCases: number;
  databaseSize: number;
  responseTime: number;
  errorRate: number;
  lastUpdated: Date;
}

interface SystemAlert {
  id: number;
  title: string;
  message: string;
  type: 'disease' | 'safety' | 'system' | 'user';
  severity: 'error' | 'warning' | 'success' | 'info';
  status: 'active' | 'resolved' | 'acknowledged';
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  assigned_to?: string;
}

interface DatabaseStatus {
  connected: boolean;
  lastBackup: Date;
  avgQueryTime: number;
}

export type DiseaseType = 'malaria' | 'diabetes' | 'hypertension';

// Custom storage implementation
class CustomStorage {
  private storage: Storage;
  private prefix: string;

  constructor(storage: Storage, prefix: string) {
    this.storage = storage;
    this.prefix = prefix;
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(`${this.prefix}${key}`, value);
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private customStorage: CustomStorage;

  constructor() {
    // Initialize custom storage
    this.customStorage = new CustomStorage(window.localStorage, 'hd_');
    
    // Create Supabase client with custom storage
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          persistSession: true,
          storageKey: 'auth-token',
          storage: {
            getItem: (key) => this.customStorage.getItem(key),
            setItem: (key, value) => this.customStorage.setItem(key, value),
            removeItem: (key) => this.customStorage.removeItem(key)
          },
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        global: {
          headers: {
            'X-Client-Info': 'health-dashboard'
          }
        }
      }
    );

    // Add error handling for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Auth methods
  async signUp(email: string, password: string, userData?: any) {
    try {
      console.log('Attempting to sign up with:', { email, userData });
      
      // First check if user already exists
      const { data: existingUser } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        console.error('User already exists with this email');
        return { 
          data: null, 
          error: { 
            message: 'A user with this email already exists',
            code: 'USER_EXISTS'
          } 
        };
      }

      // Get the current environment
      const isProduction = window.location.hostname !== 'localhost';
      const baseUrl = isProduction 
        ? 'https://health-info-237.vercel.app' // Replace with your actual Vercel URL after deployment
        : 'http://localhost:8100';

      console.log('Using base URL for email confirmation:', baseUrl);

      // Attempt to create the auth user
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            email_confirmed: false
          },
          emailRedirectTo: `${baseUrl}/auth/callback`
        }
      });

      if (error) {
        console.error('Auth signup error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        return { data: null, error };
      }

      console.log('Auth signup successful:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error during signup:', error);
      return { 
        data: null, 
        error: { 
          message: 'An unexpected error occurred during signup',
          originalError: error
        } 
      };
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  // User profile methods
  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  }

  // Disease data methods
  async getDiseaseData(diseaseType: string, region: string) {
    return this.supabase
      .from('disease_data')
      .select('*')
      .eq('disease_type', diseaseType)
      .eq('region', region)
      .order('date', { ascending: false })
      .limit(1);
  }

  async addDiseaseData(data: Omit<DiseaseData, 'id'>) {
    return this.supabase
      .from('disease_data')
      .insert([data]);
  }

  async updateDiseaseData(id: string, data: Partial<DiseaseData>) {
    return this.supabase
      .from('disease_data')
      .update(data)
      .eq('id', id);
  }

  async deleteDiseaseData(id: string) {
    return this.supabase
      .from('disease_data')
      .delete()
      .eq('id', id);
  }

  // Case reporting methods
  async reportCase(caseData: any) {
    const { data, error } = await this.supabase
      .from('reported_cases')
      .insert([caseData]);
    return { data, error };
  }

  // Notification methods
  async getNotifications(userId: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  // Real-time subscriptions
  subscribeToDiseaseUpdates(diseaseType: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`${diseaseType}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: diseaseType 
        }, 
        callback
      )
      .subscribe();
  }

  subscribeToNotifications(userId: string, callback: () => void) {
    return this.supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  async uploadData(dataType: string, data: any[]): Promise<{ error: Error | null }> {
    try {
      const table = this.getTableName(dataType);
      const { error } = await this.supabase
        .from(table)
        .insert(data);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Error uploading data:', error);
      return { error: error as Error };
    }
  }

  private getTableName(dataType: string): string {
    switch (dataType) {
      case 'malaria':
        return 'malaria_data';
      case 'diabetes':
        return 'diabetes_data';
      case 'cases': // Case reports table
        return 'case_reports';
      case 'measures':
        return 'safety_measures';
      case 'users':
        return 'profiles';
      case 'vaccinations':
        return 'vaccination_data';
      case 'system_alerts': // System alerts table
        return 'alerts';
      case 'performance_metrics': // Performance metrics table
        return 'performance_metrics';
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  // User Management Methods
  async getAllUsers() {
    try {
      console.log('Fetching all users...');
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          status,
          last_login,
          created_at,
          avatar_url,
          phone,
          location
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Users fetched successfully:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error in getAllUsers:', error);
      return { data: null, error };
    }
  }

  async updateUserRole(userId: string, role: string) {
    const { error } = await this.supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    return { error };
  }

  async updateUserStatus(userId: string, status: string) {
    const { error } = await this.supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);
    return { error };
  }

  // Report Generation Methods
  async getDiseaseReportData(diseaseType: 'malaria' | 'diabetes', timeRange: TimeRange) {
    const { data, error } = await this.supabase
      .from('disease_cases')
      .select(`
        id,
        disease_type,
        case_date,
        status,
        location,
        age_group,
        gender,
        symptoms,
        treatment,
        outcome
      `)
      .eq('disease_type', diseaseType)
      .gte('case_date', timeRange.start.toISOString())
      .lte('case_date', timeRange.end.toISOString())
      .order('case_date', { ascending: true });
    return { data, error };
  }

  async getVaccinationReportData(timeRange: TimeRange) {
    const { data, error } = await this.supabase
      .from('vaccination_data')
      .select(`
        id,
        vaccine_type,
        vaccination_date,
        location,
        age_group,
        gender,
        dose_number,
        batch_number,
        administered_by
      `)
      .gte('vaccination_date', timeRange.start.toISOString())
      .lte('vaccination_date', timeRange.end.toISOString())
      .order('vaccination_date', { ascending: true });
    return { data, error };
  }

  async getSafetyMeasuresReportData(timeRange: TimeRange) {
    const { data, error } = await this.supabase
      .from('safety_measures')
      .select(`
        id,
        measure_type,
        implementation_date,
        location,
        status,
        effectiveness_rating,
        compliance_rate,
        notes
      `)
      .gte('implementation_date', timeRange.start.toISOString())
      .lte('implementation_date', timeRange.end.toISOString())
      .order('implementation_date', { ascending: true });
    return { data, error };
  }

  getTimeRange(range: 'week' | 'month' | 'quarter' | 'year'): TimeRange {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    return { start, end };
  }

  // System Monitoring Methods
  async getSystemMetrics(): Promise<{
    databaseStatus: any;
    connectionError: any;
    backupStatus: any;
    backupError: any;
    queryStats: any;
    queryError: any;
    performanceData: any;
    performanceError: any;
  }> {
    try {
      // Get database status
      const { data: databaseStatus, error: connectionError } = await this.getDatabaseStatus();

      // Get backup status
      const { data: backup, error: backupError } = await this.supabase
        .from('backup_logs')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(1)
        .single();

      // Get query statistics
      const { data: queryStats, error: queryError } = await this.supabase.rpc('get_query_stats');

      // Get performance metrics
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
      const { data: performanceData, error: performanceError } = await this.getPerformanceMetrics({
        start: startDate,
        end: endDate
      });

      return {
        databaseStatus,
        connectionError,
        backupStatus: backup,
        backupError,
        queryStats,
        queryError,
        performanceData,
        performanceError
      };
    } catch (error) {
      console.error('Error getting system metrics:', error);
      throw error;
    }
  }

  async getSystemAlerts(): Promise<{ data: SystemAlert[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('alerts')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      
      return {
        data: data.map(alert => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          updatedAt: new Date(alert.updatedAt)
        })),
        error: null
      };
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      return { data: null, error };
    }
  }

  async getDatabaseStatus(): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await this.supabase.rpc('get_database_status');
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting database status:', error);
      return { data: null, error };
    }
  }

  async getPerformanceMetrics(timeRange: { start: Date; end: Date }): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('performance_metrics')
        .select('*')
        .gte('createdAt', timeRange.start.toISOString())
        .lte('createdAt', timeRange.end.toISOString())
        .order('createdAt', { ascending: true });
      
      if (error) throw error;
      
      return {
        data: data.map(metric => ({
          ...metric,
          createdAt: new Date(metric.createdAt)
        })),
        error: null
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return { data: null, error };
    }
  }

  private async getTotalRequests(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('system_logs')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 3600000).toISOString());

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error getting total requests:', error);
      return 0;
    }
  }

  // Alert Management Methods
  async createAlert(alert: Omit<SystemAlert, 'id'>): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('alerts')
        .insert([{
          ...alert,
          createdAt: alert.createdAt.toISOString()
        }]);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error creating alert:', error);
      return { error };
    }
  }

  async updateAlert(id: number, updates: Partial<SystemAlert>): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('alerts')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error updating alert:', error);
      return { error };
    }
  }

  async deleteAlert(id: number): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('alerts')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting alert:', error);
      return { error };
    }
  }

  async updateUserProfile(userId: string, updates: {
    full_name?: string;
    phone?: string;
    location?: string;
    avatar_url?: string;
  }): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      return { error };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { error };
    }
  }

  async getLocationDetails(location: string, startDate: Date, endDate: Date) {
    try {
      const { data: cases, error: casesError } = await this.supabase
        .from('disease_cases')
        .select('*')
        .eq('location', location)
        .gte('case_date', startDate.toISOString())
        .lte('case_date', endDate.toISOString());

      if (casesError) throw casesError;

      // Process demographics data
      const demographics = {
        ageGroups: {} as { [key: string]: number },
        gender: { male: 0, female: 0 }
      };

      cases?.forEach(case_ => {
        // Aggregate age groups
        const ageGroup = this.getAgeGroup(case_.age);
        demographics.ageGroups[ageGroup] = (demographics.ageGroups[ageGroup] || 0) + 1;

        // Aggregate gender
        if (case_.gender === 'male') {
          demographics.gender.male++;
        } else if (case_.gender === 'female') {
          demographics.gender.female++;
        }
      });

      return { data: { demographics }, error: null };
    } catch (error) {
      console.error('Error fetching location details:', error);
      return { data: null, error };
    }
  }

  private getAgeGroup(age: number): string {
    if (age < 18) return '0-17';
    if (age < 30) return '18-29';
    if (age < 45) return '30-44';
    if (age < 60) return '45-59';
    return '60+';
  }

  async getCorrelationData(startDate: Date, endDate: Date) {
    try {
      const { data: cases, error: casesError } = await this.supabase
        .from('disease_cases')
        .select('*')
        .gte('case_date', startDate.toISOString())
        .lte('case_date', endDate.toISOString());

      if (casesError) throw casesError;

      // Calculate correlations between different factors
      const factors = ['age', 'symptoms_severity', 'treatment_duration', 'recovery_time'];
      const correlations: { factor1: string; factor2: string; correlation: number }[] = [];

      for (let i = 0; i < factors.length; i++) {
        for (let j = i + 1; j < factors.length; j++) {
          const factor1 = factors[i];
          const factor2 = factors[j];
          const correlation = this.calculateCorrelation(
            cases?.map(c => c[factor1]) || [],
            cases?.map(c => c[factor2]) || []
          );
          correlations.push({ factor1, factor2, correlation });
        }
      }

      return { data: correlations, error: null };
    } catch (error) {
      console.error('Error getting correlation data:', error);
      return { data: null, error };
    }
  }

  async getTimeSeriesData(startDate: Date, endDate: Date) {
    try {
      const { data: cases, error: casesError } = await this.supabase
        .from('disease_cases')
        .select('*')
        .gte('case_date', startDate.toISOString())
        .lte('case_date', endDate.toISOString())
        .order('case_date', { ascending: true });

      if (casesError) throw casesError;

      // Perform time series decomposition
      const timeSeriesData = this.decomposeTimeSeries(cases || []);
      return { data: timeSeriesData, error: null };
    } catch (error) {
      console.error('Error getting time series data:', error);
      return { data: null, error };
    }
  }

  async getDemographicPyramid(startDate: Date, endDate: Date) {
    try {
      const { data: cases, error: casesError } = await this.supabase
        .from('disease_cases')
        .select('*')
        .gte('case_date', startDate.toISOString())
        .lte('case_date', endDate.toISOString());

      if (casesError) throw casesError;

      // Process demographic data
      const ageGroups = ['0-17', '18-29', '30-44', '45-59', '60+'];
      const pyramid = ageGroups.map(ageGroup => ({
        ageGroup,
        male: 0,
        female: 0
      }));

      cases?.forEach(case_ => {
        const ageGroup = this.getAgeGroup(case_.age);
        const index = ageGroups.indexOf(ageGroup);
        if (index !== -1) {
          if (case_.gender === 'male') {
            pyramid[index].male++;
          } else if (case_.gender === 'female') {
            pyramid[index].female++;
          }
        }
      });

      return { data: pyramid, error: null };
    } catch (error) {
      console.error('Error getting demographic pyramid:', error);
      return { data: null, error };
    }
  }

  async getTreatmentEffectiveness(startDate: Date, endDate: Date) {
    try {
      const { data: cases, error: casesError } = await this.supabase
        .from('disease_cases')
        .select('*')
        .gte('case_date', startDate.toISOString())
        .lte('case_date', endDate.toISOString());

      if (casesError) throw casesError;

      // Process treatment effectiveness data
      const treatments = new Map<string, {
        success: number;
        total: number;
        recoveryTimes: number[];
        costs: number[];
      }>();

      cases?.forEach(case_ => {
        const treatment = case_.treatment;
        if (!treatment) return;

        if (!treatments.has(treatment)) {
          treatments.set(treatment, {
            success: 0,
            total: 0,
            recoveryTimes: [],
            costs: []
          });
        }

        const stats = treatments.get(treatment)!;
        stats.total++;
        if (case_.outcome === 'recovered') {
          stats.success++;
        }
        if (case_.recovery_time) {
          stats.recoveryTimes.push(case_.recovery_time);
        }
        if (case_.treatment_cost) {
          stats.costs.push(case_.treatment_cost);
        }
      });

      const effectiveness = Array.from(treatments.entries()).map(([treatment, stats]) => ({
        treatment,
        successRate: stats.success / stats.total,
        recoveryTime: this.calculateAverage(stats.recoveryTimes),
        cost: this.calculateAverage(stats.costs)
      }));

      return { data: effectiveness, error: null };
    } catch (error) {
      console.error('Error getting treatment effectiveness:', error);
      return { data: null, error };
    }
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * (y[i] || 0), 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private decomposeTimeSeries(cases: any[]): any[] {
    // Group cases by date
    const dailyCases = new Map<string, number>();
    cases.forEach(case_ => {
      const date = new Date(case_.case_date).toISOString().split('T')[0];
      dailyCases.set(date, (dailyCases.get(date) || 0) + 1);
    });

    // Convert to array and sort by date
    const dates = Array.from(dailyCases.keys()).sort();
    const values = dates.map(date => dailyCases.get(date) || 0);

    // Calculate trend using simple moving average
    const trend = this.calculateMovingAverage(values, 7);

    // Calculate seasonal component (assuming weekly seasonality)
    const seasonal = this.calculateSeasonalComponent(values, 7);

    // Calculate residual
    const residual = values.map((value, i) => 
      value - (trend[i] || 0) - (seasonal[i] || 0)
    );

    return dates.map((date, i) => ({
      date: new Date(date),
      trend: trend[i] || 0,
      seasonal: seasonal[i] || 0,
      residual: residual[i] || 0,
      actual: values[i] || 0
    }));
  }

  private calculateMovingAverage(values: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(values.length, i + Math.floor(window / 2) + 1);
      const sum = values.slice(start, end).reduce((a, b) => a + b, 0);
      result.push(sum / (end - start));
    }
    return result;
  }

  private calculateSeasonalComponent(values: number[], period: number): number[] {
    const seasonal: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const seasonalIndex = i % period;
      const seasonalValue = values
        .filter((_, j) => j % period === seasonalIndex)
        .reduce((a, b) => a + b, 0) / Math.floor(values.length / period);
      seasonal.push(seasonalValue);
    }
    return seasonal;
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  async createHealthReport(reportData: any) {
    try {
      const { data, error } = await this.supabase
        .from('health_reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating health report:', error);
      return { data: null, error };
    }
  }

  async createUserProfile(profile: Partial<UserProfile>) {
    try {
      console.log('Attempting to create profile with data:', profile);
      
      // Ensure we have all required fields
      const profileData = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role || 'public_user',
        phone: profile.phone || null,
        location: profile.location || null,
        status: profile.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Supabase profile creation error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Profile created successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return { data: null, error };
    }
  }

  async getCurrentSession() {
    return this.supabase.auth.getSession();
  }

  async resetAdminPassword(email: string) {
    try {
      console.log('Attempting to reset password for:', email);
      // Get the current application URL
      const baseUrl = window.location.origin;
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/reset-password`
      });

      if (error) {
        console.error('Error resetting password:', error);
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Error in resetAdminPassword:', error);
      return { error };
    }
  }

  async updateUserPassword(newPassword: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });
      return { error };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      return { error };
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      return { error };
    }
  }

  async createCaseReport(reportData: any) {
    try {
      // First, create the case report
      const { data: caseReport, error: caseError } = await this.supabase
        .from('case_reports')
        .insert([reportData])
        .select()
        .single();

      if (caseError) throw caseError;

      // Get all admin users
      const { data: admins, error: adminError } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (adminError) throw adminError;

      // Create notifications for all admins
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: 'New Case Report',
        message: `A new ${reportData.case_type} case has been reported in ${reportData.city}, ${reportData.region}.`,
        type: 'case_report',
        reference_id: caseReport.id,
        created_at: new Date().toISOString()
      }));

      // Insert notifications
      const { error: notificationError } = await this.supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      return { data: caseReport, error: null };
    } catch (error) {
      console.error('Error creating case report:', error);
      return { data: null, error };
    }
  }

  async markNotificationAsRead(notificationId: string) {
    return this.supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  }

  async getUnreadNotificationCount(userId: string) {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
    return count || 0;
  }

  async deleteUser(userId: string): Promise<{ error: any }> {
    try {
      // First, delete the user from the profiles table
      const { error: profileError } = await this.supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        throw profileError; // Propagate error if profile deletion fails
      }

      // Then, delete the user from Supabase Auth
      const { error: authError } = await this.supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('Error deleting user from Auth:', authError);
        // Consider rolling back profile deletion if auth deletion fails (more complex, might need a server function)
        throw authError; // Propagate error if auth deletion fails
      }

      console.log(`User with ID ${userId} deleted successfully.`);
      return { error: null };
    } catch (error) {
      console.error('Comprehensive error during user deletion:', error);
      return { error };
    }
  }
} 