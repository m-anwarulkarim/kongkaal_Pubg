import pg from 'pg'
import dotenv from 'dotenv'

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

async function main() {
  console.log('⏳ Connecting to Supabase Postgres database...')
  await client.connect()
  console.log('✅ Connected to Supabase DB!')

  const sql = `
  -- 1. Matches Table
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

  -- 2. Slot Registrations Table
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

  -- 3. Wallet Transactions Table
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

  -- 4. Customer Wallets Table
  CREATE TABLE IF NOT EXISTS public.customer_wallets (
    email TEXT PRIMARY KEY,
    name TEXT,
    pubg_uid TEXT,
    whatsapp_number TEXT,
    balance NUMERIC DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- 5. Leaderboards Table
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

  -- 6. Support Messages Table
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

  -- 7. Disable RLS on public tables
  ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.wallet_transactions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.customer_wallets DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.leaderboards DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.support_messages DISABLE ROW LEVEL SECURITY;
  `

  console.log('⏳ Creating tables in Supabase Postgres...')
  await client.query(sql)

  // Seed default matches if empty
  const matchesCount = await client.query('SELECT COUNT(*) FROM public.matches')
  if (parseInt(matchesCount.rows[0].count) === 0) {
    console.log('🌱 Seeding initial matches into Supabase...')
    await client.query(`
      INSERT INTO public.matches (id, title, mode, map, time, entry_fee, winner_prize, first_prize, second_prize, third_prize, per_kill_prize, joined_slots, max_slots, image, status, whatsapp_group_link)
      VALUES
      ('solo-12sep', 'SOLO BATTLE', 'SOLO', 'Erangel', '10:00 PM', 50, 2000, 1000, 500, 300, 10, 24, 100, '/solo_battle.webp', 'OPEN', 'https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K'),
      ('duo-13sep', 'DUO BATTLE', 'DUO', 'Erangel', '10:00 PM', 100, 5000, 2500, 1500, 1000, 20, 18, 50, '/duo_battle.webp', 'OPEN', 'https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K'),
      ('squad-14sep', 'SQUAD SHOWDOWN', 'SQUAD', 'Livik', '09:00 PM', 200, 10000, 5000, 3000, 2000, 30, 12, 50, '/squad_showdown.webp', 'OPEN', 'https://whatsapp.com/channel/0029Vb8kbvtK5cDCZ4I3rf0K');
    `)
    console.log('✅ Matches seeded!')
  }

  console.log('🎉 ALL TABLES & PERMISSIONS CREATED SUCCESSFULLY IN SUPABASE!')
  await client.end()
}

main().catch((err) => {
  console.error('❌ Database migration error:', err)
  process.exit(1)
})
