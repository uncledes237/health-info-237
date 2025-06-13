export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  read: boolean;
  created_at: string;
  link?: string;
} 