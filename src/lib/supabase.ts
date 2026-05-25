import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  team_name: string;
  car_number: string;
  favorite_driver: string;
  onboarding_complete: boolean;
  theme_preference: string;
  telemetry_refresh_rate: number;
  created_at: string;
};

export type TelemetrySession = {
  id: string;
  user_id: string;
  session_name: string;
  track_name: string;
  driver_name: string;
  car_number: number;
  status: string;
  started_at: string;
  ended_at: string | null;
};

export type TelemetryPoint = {
  id: string;
  session_id: string;
  timestamp: string;
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  gear: number;
  fuel_level: number;
  tire_temp_fl: number;
  tire_temp_fr: number;
  tire_temp_rl: number;
  tire_temp_rr: number;
  brake_temp_fl: number;
  brake_temp_fr: number;
  brake_temp_rl: number;
  brake_temp_rr: number;
  lap_time: number;
  sector_1: number;
  sector_2: number;
  sector_3: number;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  session_id: string | null;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};
