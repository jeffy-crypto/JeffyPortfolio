import { createClient } from '@supabase/supabase-js'

// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const supabaseUrl = 'https://bjijaorqffzwqgheunln.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaWphb3JxZmZ6d3FnaGV1bmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzczMjEsImV4cCI6MjA4MDk1MzMyMX0.2F71j6a3dCD0MBifnUZn5Vh0MD26B6HobT7lkGUSpUM'

export const supabase = createClient(supabaseUrl, supabaseKey)