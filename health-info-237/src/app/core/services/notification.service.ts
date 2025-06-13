import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  read: boolean;
  created_at: string;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  constructor(private supabase: SupabaseService) {
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    try {
      const { data: notifications, error } = await this.supabase.client
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      this.notifications.next(notifications || []);
      this.updateUnreadCount();
      
      // Subscribe to real-time notifications
      this.supabase.client
        .channel('notifications')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            const newNotification = payload.new as Notification;
            const currentNotifications = this.notifications.value;
            this.notifications.next([newNotification, ...currentNotifications]);
            this.updateUnreadCount();
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  private updateUnreadCount() {
    const count = this.notifications.value.filter(n => !n.read).length;
    this.unreadCount.next(count);
  }

  async markAsRead(notificationId: string) {
    try {
      const { error } = await this.supabase.client
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      const currentNotifications = this.notifications.value;
      const updatedNotifications = currentNotifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      this.notifications.next(updatedNotifications);
      this.updateUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead() {
    try {
      const { error } = await this.supabase.client
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;

      const currentNotifications = this.notifications.value;
      const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
      
      this.notifications.next(updatedNotifications);
      this.updateUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }
} 