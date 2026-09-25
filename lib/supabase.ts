import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://urzdhkkpfaibpddnaygl.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyemRoa2twZmFpYnBkZG5heWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2Mzc1NTYsImV4cCI6MjA5ODIxMzU1Nn0.y6jhMeXJE-MjUCmRhjX63AtIEA2LhuyfOBrWwrk9mW0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
