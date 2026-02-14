import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aqwuzlfzjkdpedwhefxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxd3V6bGZ6amtkcGVkd2hlZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNDM4NTIsImV4cCI6MjA4NjYxOTg1Mn0.VH1i3Fv4uBj7mGhHqeTcfh9_wixbAY_JAWXs8DAfkt8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
