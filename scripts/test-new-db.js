import pg from 'pg'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Testing NEW Database Connection...')
console.log('🔗 Supabase URL:', supabaseUrl)

async function testNewDb() {
  // 1. Direct PG Test
  const client = new pg.Client({ connectionString: directUrl, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    console.log('✅ PostgreSQL Direct Connection Successful!')
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    console.log('📋 Existing tables in public schema:', res.rows.map(r => r.table_name))
    await client.end()
  } catch (err) {
    console.error('❌ PostgreSQL Connection Failed:', err.message)
  }

  // 2. Supabase Client REST Test
  const supabase = createClient(supabaseUrl, supabaseKey)
  try {
    const { data, error } = await supabase.from('customer_wallets').select('*')
    if (error) {
      console.log('ℹ️ Supabase REST API response:', error.message)
    } else {
      console.log('✅ Supabase REST API Connection Successful! Rows:', data.length)
    }
  } catch (err) {
    console.error('❌ Supabase REST Failed:', err.message)
  }
}

testNewDb()
