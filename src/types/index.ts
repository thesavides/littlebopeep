// Core domain types for Little Bo Peep

export type UserRole = 'walker' | 'farmer' | 'admin';

export type ReportStatus = 'pending' | 'claimed' | 'resolved' | 'dismissed';

export type SubscriptionStatus = 'active' | 'inactive' | 'trial';

export type ReportAction = 'mine' | 'not_mine' | 'resolved';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeoJSON {
  type: 'Polygon' | 'Point';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coordinates: any;
}

export type SheepTag = 
  | 'alone' 
  | 'near_road' 
  | 'in_town' 
  | 'looks_distressed' 
  | 'multiple_sheep'
  | 'injured'
  | 'other';

export interface Report {
  id: string;
  walker_id: string;
  lat: number;
  lng: number;
  geohash: string;
  created_at: string;
  updated_at: string;
  tags: SheepTag[];
  photo_url: string | null;
  description: string | null;
  status: ReportStatus;
  claimed_by: string | null;
  resolved_at: string | null;
}

export interface Farmer {
  id: string;
  user_id: string;
  holding_name: string;
  alert_area: GeoJSON;
  alert_radius_km: number | null;
  center_lat: number | null;
  center_lng: number | null;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
  email: string;
  phone: string | null;
  sms_alerts: boolean;
  email_alerts: boolean;
  push_alerts: boolean;
  muted_until: string | null;
}

export interface Match {
  id: string;
  report_id: string;
  farmer_id: string;
  action: ReportAction | null;
  notified_at: string;
  viewed_at: string | null;
  action_at: string | null;
  created_at: string;
}

export interface Walker {
  id: string;
  user_id: string;
  reports_count: number;
  flagged: boolean;
  blocked: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// API Request/Response types
export interface CreateReportRequest {
  lat: number;
  lng: number;
  tags: SheepTag[];
  photo?: File | null;
  description?: string;
}

export interface CreateReportResponse {
  success: boolean;
  report?: Report;
  error?: string;
  duplicate_warning?: boolean;
}

export interface AlertWithReport extends Match {
  report: Report;
  distance_km: number;
}

export interface DashboardStats {
  total_reports: number;
  pending_reports: number;
  claimed_reports: number;
  resolved_reports: number;
  avg_resolution_time_hours: number;
}

// Form state types
export interface ReportFormState {
  step: 'location' | 'evidence' | 'safety' | 'confirm';
  location: Coordinates | null;
  locationConfirmed: boolean;
  photo: File | null;
  photoPreview: string | null;
  tags: SheepTag[];
  description: string;
  safetyAcknowledged: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface HoldingSetupState {
  holdingName: string;
  drawMode: 'polygon' | 'radius';
  polygon: GeoJSON | null;
  center: Coordinates | null;
  radiusKm: number;
  isSubmitting: boolean;
  error: string | null;
}
