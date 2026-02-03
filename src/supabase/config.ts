import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// Se recomienda usar variables de entorno para mayor seguridad en producción
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umkztstvkbhghlkimsip.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta3p0c3R2a2JoZ2hsa2ltc2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzcxNTUsImV4cCI6MjA4MzQxMzE1NX0.VKMt4RrTdFcbarnfOOosPQxxzY0i20qatv1HSXBbPeY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,  // Deshabilitado para evitar conflictos con múltiples usuarios
        autoRefreshToken: false,  // No necesitamos tokens de Supabase Auth
        detectSessionInUrl: false,  // No detectar sesiones en la URL
        storage: undefined  // No guardar sesiones en localStorage
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    },
    global: {
        headers: {
            'x-application-name': 'sport-lentes'
        }
    }
});

export default supabase;
