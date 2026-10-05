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
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// =========================================================
// CHECK ENVIRONMENT VARIABLES
// =========================================================

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY di .env.local pada root project'
  )
}

// =========================================================
// CREATE SUPABASE CLIENT
// =========================================================

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)