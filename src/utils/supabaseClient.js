// =========================================================
// NUSAJOY — SUPABASE CLIENT
// =========================================================
// Tambahkan dua baris ini di file .env.local (root project):
//
// VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
//
// Ambil dari:
// Supabase Dashboard
// → Project Settings
// → API
//
// Install library jika belum ada:
// npm install @supabase/supabase-js
// =========================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY

// =========================================================
// CHECK ENVIRONMENT VARIABLES
// =========================================================

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum di-set di .env.local'
  )
}

// =========================================================
// CREATE SUPABASE CLIENT
// =========================================================

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)