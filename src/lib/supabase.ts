import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are present
const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
    console.warn("⚠️ Supabase environment variables missing. App running in Demo Mode.");
}

// Export real client or a safe fallback to prevent crashes
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        from: () => ({
            select: () => ({
                order: () => Promise.resolve({ data: null, error: { message: "Demo Mode: No DB connection" } }),
                eq: () => ({
                    single: () => Promise.resolve({ data: null, error: { message: "Demo Mode: No DB connection" } }),
                }),
            }),
        }),
        storage: {
            from: () => ({
                getPublicUrl: () => ({ data: { publicUrl: "" } })
            })
        }
    } as any;
