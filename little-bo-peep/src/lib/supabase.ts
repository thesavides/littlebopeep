import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role for admin operations
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, serviceRoleKey);
};

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string;
          walker_id: string;
          lat: number;
          lng: number;
          geohash: string;
          created_at: string;
          updated_at: string;
          tags: string[];
          photo_url: string | null;
          description: string | null;
          status: string;
          claimed_by: string | null;
          resolved_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
      farmers: {
        Row: {
          id: string;
          user_id: string;
          holding_name: string;
          alert_area: object;
          alert_radius_km: number | null;
          center_lat: number | null;
          center_lng: number | null;
          subscription_status: string;
          created_at: string;
          updated_at: string;
          email: string;
          phone: string | null;
          sms_alerts: boolean;
          email_alerts: boolean;
          push_alerts: boolean;
          muted_until: string | null;
        };
        Insert: Omit<Database['public']['Tables']['farmers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['farmers']['Insert']>;
      };
      matches: {
        Row: {
          id: string;
          report_id: string;
          farmer_id: string;
          action: string | null;
          notified_at: string;
          viewed_at: string | null;
          action_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['matches']['Insert']>;
      };
      walkers: {
        Row: {
          id: string;
          user_id: string;
          reports_count: number;
          flagged: boolean;
          blocked: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['walkers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['walkers']['Insert']>;
      };
    };
  };
};
