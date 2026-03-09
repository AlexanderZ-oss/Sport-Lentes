import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// Se recomienda usar variables de entorno para mayor seguridad en producción
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umkztstvkbhghlkimsip.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta3p0c3R2a2JoZ2hsa2ltc2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzcxNTUsImV4cCI6MjA4MzQxMzE1NX0.VKMt4RrTdFcbarnfOOosPQxxzY0i20qatv1HSXBbPeY';

console.log("Supabase Client initialized with URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: undefined
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    },
    global: {
        headers: {
            'x-application-name': 'sport-lentes'
        },
        fetch: (...args) => fetch(...args).catch(err => {
            console.error("Supabase Global Fetch Error:", err);
            throw err;
        })
    }
});

export default supabase;
