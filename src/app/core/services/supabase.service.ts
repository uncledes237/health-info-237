import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  public get client(): SupabaseClient {
    return this.supabase;
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
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }
} 