import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { Session, AuthError } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  location?: string;
  status?: string;
  last_login?: string;
}

interface ProfileError {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
  status?: number;
  name?: string;
}

export interface SignUpData {
  full_name: string;
  role: string;
  location?: string;
  status?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Clear any existing auth state that might be corrupted
      const currentSession = await this.getCurrentSession();
      if (!currentSession) {
        // If no valid session exists, ensure we're logged out
        this.currentUserSubject.next(null);
        return;
      }

      // Try to get the user profile with retries
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { data: profile } = await this.supabaseService.getUserProfile(currentSession.user.id);
          if (profile) {
            this.currentUserSubject.next(profile);
            return;
          }
          break;
        } catch (error: any) {
          console.error(`Attempt ${retryCount + 1} to load profile failed:`, error);
          
          if (error.name === 'NavigatorLockAcquireTimeoutError') {
            retryCount++;
            if (retryCount < maxRetries) {
              // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
              continue;
            }
          }
          
          // For other errors or if we've exhausted retries
          this.currentUserSubject.next(null);
          await this.supabaseService.signOut();
          break;
        }
      }
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      this.currentUserSubject.next(null);
      
      // If we get a storage-related error, try to clear the auth state
      if (error.name === 'NavigatorLockAcquireTimeoutError' || 
          error.message?.includes('storage') || 
          error.message?.includes('lock')) {
        try {
          await this.supabaseService.signOut();
        } catch (signOutError) {
          console.error('Error during cleanup signout:', signOutError);
        }
      }
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    return this.supabaseService.getSession();
  }

  async signUp(email: string, password: string, userData: SignUpData): Promise<{ error: any }> {
    try {
      console.log('Starting signup process...');
      
      // Validate input
      if (!email || !password || !userData.full_name) {
        return { 
          error: { 
            message: 'Please fill in all required fields',
            code: 'INVALID_INPUT'
          } 
        };
      }

      // Check password strength
      if (password.length < 8) {
        return {
          error: {
            message: 'Password must be at least 8 characters long',
            code: 'WEAK_PASSWORD'
          }
        };
      }

      const { data, error } = await this.supabaseService.signUp(email, password, userData);
      
      if (error) {
        console.error('Error during Supabase signup:', error);
        
        // Handle specific error cases
        if (error.code === 'USER_EXISTS') {
          return { error: { message: 'A user with this email already exists' } };
        }
        
        if (error.message?.includes('database')) {
          return { 
            error: { 
              message: 'Unable to create account. Please try again later or contact support.',
              code: 'DATABASE_ERROR'
            } 
          };
        }

        throw error;
      }

      console.log('Auth signup successful, user data:', data);

      if (data?.user) {
        console.log('Creating user profile for:', data.user.id);
        // Log the current session
        const { data: session } = await this.supabaseService.getCurrentSession();
        console.log('Current session before profile creation:', session);

        // Create user profile
        const { error: profileError } = await this.supabaseService.createUserProfile({
          id: data.user.id,
          email: data.user.email!,
          ...userData
        });

        if (profileError) {
          const typedError = profileError as ProfileError;
          console.error('Error creating user profile:', {
            message: typedError.message,
            details: typedError.details,
            hint: typedError.hint,
            code: typedError.code,
            status: typedError.status,
            name: typedError.name
          });

          // If profile creation fails, we should clean up the auth user
          await this.supabaseService.signOut();
          return { 
            error: { 
              message: 'Account created but profile setup failed. Please contact support.',
              code: 'PROFILE_CREATION_FAILED',
              details: typedError
            } 
          };
        }
        console.log('User profile created successfully');
      }

      return { error: null };
    } catch (error: any) {
      const typedError = error as ProfileError;
      console.error('Detailed signup error:', {
        message: typedError.message,
        details: typedError.details,
        hint: typedError.hint,
        code: typedError.code,
        status: typedError.status,
        name: typedError.name,
        stack: error.stack
      });
      return { 
        error: { 
          message: 'An unexpected error occurred. Please try again later.',
          code: 'UNEXPECTED_ERROR',
          details: typedError
        } 
      };
    }
  }

  async signIn(email: string, password: string): Promise<{ error: any }> {
    try {
      // Clear any existing session before signing in
      await this.supabaseService.signOut();
      
      const { data, error } = await this.supabaseService.signIn(email, password);
      if (error) throw error;

      if (data?.user) {
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const { data: profile } = await this.supabaseService.getUserProfile(data.user.id);
            if (profile) {
              this.currentUserSubject.next(profile);
              return { error: null };
            }
            break;
          } catch (error: any) {
            console.error(`Attempt ${retryCount + 1} to load profile failed:`, error);
            
            if (error.name === 'NavigatorLockAcquireTimeoutError') {
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                continue;
              }
            }
            throw error;
          }
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      // Ensure we're logged out if there's an error
      await this.supabaseService.signOut();
      this.currentUserSubject.next(null);
      return { error };
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.supabaseService.signOut();
      this.currentUserSubject.next(null);
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  isHealthOfficial(): boolean {
    return this.currentUserSubject.value?.role === 'health_official';
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  async requestPasswordReset(email: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabaseService.resetPassword(email);
      if (error) {
        console.error('Error requesting password reset:', error);
        return { error };
      }
      return { error: null };
    } catch (error: any) {
      console.error('Error in requestPasswordReset:', error);
      return { error };
    }
  }
} 