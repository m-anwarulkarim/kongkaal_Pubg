import pg from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DIRECT_URL or DATABASE_URL missing from .env')
  process.exit(1)
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

async function restoreDatabase() {
  console.log('🚀 Starting Data Restore to NEW Supabase Database...')

  try {
    await client.connect()
    console.log('✅ Connected to NEW Postgres DB!')

    // 1. Create Tables
    console.log('⏳ Creating schema tables in public...')
    const schemaSql = `
    CREATE TABLE IF NOT EXISTS public.matches (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title TEXT NOT NULL,
      mode TEXT NOT NULL,
      map TEXT NOT NULL,
      time TEXT NOT NULL,
      entry_fee NUMERIC NOT NULL DEFAULT 0,
      winner_prize NUMERIC NOT NULL DEFAULT 0,
      first_prize NUMERIC DEFAULT 0,
      second_prize NUMERIC DEFAULT 0,
      third_prize NUMERIC DEFAULT 0,
      per_kill_prize NUMERIC DEFAULT 0,
      joined_slots INTEGER DEFAULT 0,
      max_slots INTEGER DEFAULT 100,
      image TEXT,
      status TEXT DEFAULT 'OPEN',
      whatsapp_group_link TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.registrations (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      match_id TEXT,
      team_name TEXT,
      player1_name TEXT NOT NULL,
      player1_uid TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      player2_name TEXT,
      player2_uid TEXT,
      player3_name TEXT,
      player3_uid TEXT,
      player4_name TEXT,
      player4_uid TEXT,
      payment_method TEXT NOT NULL,
      trx_id TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      status TEXT DEFAULT 'PENDING',
      room_id TEXT,
      room_password TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.wallet_transactions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_email TEXT NOT NULL,
      user_name TEXT,
      type TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      payment_method TEXT,
      trx_id TEXT,
      account_number TEXT,
      status TEXT DEFAULT 'PENDING',
      note TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.customer_wallets (
      email TEXT PRIMARY KEY,
      name TEXT,
      pubg_uid TEXT,
      whatsapp_number TEXT,
      balance NUMERIC DEFAULT 0,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.leaderboards (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      match_title TEXT NOT NULL,
      team_name TEXT NOT NULL,
      player_ign TEXT NOT NULL,
      pubg_uid TEXT,
      avatar_url TEXT,
      rank TEXT DEFAULT 'CHAMPION',
      kills INTEGER DEFAULT 0,
      prize_won NUMERIC DEFAULT 0,
      status TEXT DEFAULT 'VERIFIED PAYOUT',
      is_pinned BOOLEAN DEFAULT false,
      pinned_position INTEGER,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.support_messages (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_avatar TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      admin_reply TEXT,
      replied_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Disable RLS for smooth client read/write
    ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.wallet_transactions DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.customer_wallets DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.leaderboards DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.support_messages DISABLE ROW LEVEL SECURITY;
    `
    await client.query(schemaSql)
    console.log('✅ Tables & RLS created successfully!')

    // 2. Find latest backup JSON file
    const backupDir = path.resolve(process.cwd(), 'backup')
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse()

    if (files.length === 0) {
      console.error('❌ No backup JSON file found in backup/')
      process.exit(1)
    }

    const latestBackupFile = path.join(backupDir, files[0])
    console.log(`\n📄 Loading backup data from: ${latestBackupFile}...`)
    const backupContent = JSON.parse(fs.readFileSync(latestBackupFile, 'utf8'))

    const publicTables = backupContent.schemas?.public || backupContent.tables

    if (!publicTables) {
      console.error('❌ Could not parse public tables from backup JSON')
      process.exit(1)
    }

    // Restore each table
    for (const [tableName, tableData] of Object.entries(publicTables)) {
      const rows = tableData.rows || []
      const columns = tableData.columns || []

      if (rows.length === 0) {
        console.log(`⏩ Skipping empty table: public.${tableName}`)
        continue
      }

      console.log(`📥 Restoring ${rows.length} rows into public.${tableName}...`)

      const colNames = columns.map(c => `"${c.column_name}"`).join(', ')

      for (const row of rows) {
        const valuePlaceholders = columns.map((_, i) => `$${i + 1}`).join(', ')
        const values = columns.map(c => {
          let val = row[c.column_name]
          if (val && typeof val === 'object' && !(val instanceof Date)) {
            val = JSON.stringify(val)
          }
          return val
        })

        const insertQuery = `
          INSERT INTO public."${tableName}" (${colNames})
          VALUES (${valuePlaceholders})
          ON CONFLICT DO NOTHING;
        `
        try {
          await client.query(insertQuery, values)
        } catch (err) {
          console.warn(`  ⚠️ Row insert warning in ${tableName}:`, err.message)
        }
      }
      console.log(`  ✅ Restored ${tableName}!`)
    }

    console.log('\n==========================================')
    console.log('🎉 ALL BACKUP DATA RESTORED TO NEW DATABASE SUCCESSFULLY!')
    console.log('==========================================\n')

  } catch (err) {
    console.error('❌ Restore failed:', err)
  } finally {
    await client.end()
  }
}

restoreDatabase()
