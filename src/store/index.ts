import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Report, 
  Farmer, 
  AlertWithReport, 
  ReportFormState, 
  Coordinates, 
  SheepTag,
  UserRole 
} from '@/types';

// Auth store
interface AuthState {
  userId: string | null;
  role: UserRole | null;
  farmerId: string | null;
  walkerId: string | null;
  isAuthenticated: boolean;
  setAuth: (userId: string, role: UserRole, farmerId?: string, walkerId?: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      farmerId: null,
      walkerId: null,
      isAuthenticated: false,
      setAuth: (userId, role, farmerId, walkerId) =>
        set({ userId, role, farmerId, walkerId, isAuthenticated: true }),
      clearAuth: () =>
        set({ userId: null, role: null, farmerId: null, walkerId: null, isAuthenticated: false }),
    }),
    {
      name: 'lbp-auth',
    }
  )
);

// Report form store
interface ReportFormStore extends ReportFormState {
  setStep: (step: ReportFormState['step']) => void;
  setLocation: (location: Coordinates) => void;
  confirmLocation: () => void;
  setPhoto: (photo: File | null, preview: string | null) => void;
  toggleTag: (tag: SheepTag) => void;
  setDescription: (description: string) => void;
  acknowledgeSafety: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialReportFormState: ReportFormState = {
  step: 'location',
  location: null,
  locationConfirmed: false,
  photo: null,
  photoPreview: null,
  tags: [],
  description: '',
  safetyAcknowledged: false,
  isSubmitting: false,
  error: null,
};

export const useReportFormStore = create<ReportFormStore>((set) => ({
  ...initialReportFormState,
  setStep: (step) => set({ step }),
  setLocation: (location) => set({ location, locationConfirmed: false }),
  confirmLocation: () => set({ locationConfirmed: true, step: 'evidence' }),
  setPhoto: (photo, preview) => set({ photo, photoPreview: preview }),
  toggleTag: (tag) =>
    set((state) => ({
      tags: state.tags.includes(tag)
        ? state.tags.filter((t) => t !== tag)
        : [...state.tags, tag],
    })),
  setDescription: (description) => set({ description }),
  acknowledgeSafety: () => set({ safetyAcknowledged: true }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error }),
  reset: () => set(initialReportFormState),
}));

// Walker reports store
interface WalkerReportsStore {
  reports: Report[];
  isLoading: boolean;
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useWalkerReportsStore = create<WalkerReportsStore>((set) => ({
  reports: [],
  isLoading: false,
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Farmer alerts store
interface FarmerAlertsStore {
  alerts: AlertWithReport[];
  farmer: Farmer | null;
  isLoading: boolean;
  filter: 'all' | 'pending' | 'claimed' | 'resolved';
  setAlerts: (alerts: AlertWithReport[]) => void;
  setFarmer: (farmer: Farmer | null) => void;
  updateAlert: (alertId: string, updates: Partial<AlertWithReport>) => void;
  setLoading: (isLoading: boolean) => void;
  setFilter: (filter: 'all' | 'pending' | 'claimed' | 'resolved') => void;
}

export const useFarmerAlertsStore = create<FarmerAlertsStore>((set) => ({
  alerts: [],
  farmer: null,
  isLoading: false,
  filter: 'all',
  setAlerts: (alerts) => set({ alerts }),
  setFarmer: (farmer) => set({ farmer }),
  updateAlert: (alertId, updates) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, ...updates } : alert
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setFilter: (filter) => set({ filter }),
}));

// Map store for shared map state
interface MapStore {
  center: Coordinates;
  zoom: number;
  userLocation: Coordinates | null;
  isLocating: boolean;
  setCenter: (center: Coordinates) => void;
  setZoom: (zoom: number) => void;
  setUserLocation: (location: Coordinates | null) => void;
  setLocating: (isLocating: boolean) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  // Default to UK center
  center: { lat: 54.5, lng: -2.5 },
  zoom: 6,
  userLocation: null,
  isLocating: false,
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setUserLocation: (location) => set({ userLocation: location }),
  setLocating: (isLocating) => set({ isLocating }),
}));

// UI store for global UI state
interface UIStore {
  isMobileMenuOpen: boolean;
  activeModal: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  activeModal: null,
  toast: null,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  showToast: (message, type) => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));
