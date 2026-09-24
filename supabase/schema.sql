-- ========================================================
-- KONGKAAL GAMING - SUPABASE DATABASE SCHEMA
-- ========================================================

-- 1. Create Enums
CREATE TYPE game_mode AS ENUM ('SOLO', 'DUO', 'SQUAD');
CREATE TYPE match_status AS ENUM ('OPEN', 'FILLING_FAST', 'LIVE_SOON', 'COMPLETED');
CREATE TYPE payment_gateway AS ENUM ('bKash', 'Nagad', 'Rocket');
CREATE TYPE registration_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- 2. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  mode game_mode NOT NULL DEFAULT 'SOLO',
  map TEXT NOT NULL DEFAULT 'Erangel',
  time TEXT NOT NULL,
  entry_fee NUMERIC NOT NULL DEFAULT 50,
  winner_prize NUMERIC NOT NULL DEFAULT 2000,
  per_kill_prize NUMERIC NOT NULL DEFAULT 10,
  joined_slots INT NOT NULL DEFAULT 0,
  max_slots INT NOT NULL DEFAULT 100,
  image TEXT NOT NULL,
  status match_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Slot Registrations & TrxID Table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
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
  payment_method payment_gateway NOT NULL DEFAULT 'bKash',
  trx_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status registration_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Leaderboard & Player Stats Table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank INT NOT NULL,
  player_name TEXT NOT NULL,
  player_uid TEXT,
  kills INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  prize_won NUMERIC NOT NULL DEFAULT 0,
  avatar_url TEXT NOT NULL DEFAULT '/solo_match.jpg',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. UC & Gaming Store Products Table
CREATE TABLE IF NOT EXISTS public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'UC_TOPUP',
  price_bdt NUMERIC NOT NULL,
  original_price_bdt NUMERIC,
  image TEXT NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  stock INT NOT NULL DEFAULT 50,
  badge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

-- Allow Public Reads
CREATE POLICY "Public matches read access" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public leaderboard read access" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "Public store_products read access" ON public.store_products FOR SELECT USING (true);

-- Allow Public Insert for Registrations
CREATE POLICY "Public insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);

-- ========================================================
-- SEED INITIAL DATA
-- ========================================================

INSERT INTO public.matches (title, mode, map, time, entry_fee, winner_prize, per_kill_prize, joined_slots, max_slots, image, status) VALUES
('SOLO BATTLE', 'SOLO', 'Erangel', '10:00 PM', 50, 2000, 10, 24, 100, '/solo_battle.jpg', 'OPEN'),
('DUO BATTLE', 'DUO', 'Erangel', '10:00 PM', 100, 5000, 20, 18, 50, '/duo_battle.jpg', 'OPEN'),
('SQUAD SHOWDOWN', 'SQUAD', 'Livik', '09:00 PM', 200, 10000, 30, 12, 50, '/squad_showdown.jpg', 'OPEN');

INSERT INTO public.leaderboard (rank, player_name, kills, wins, prize_won, avatar_url) VALUES
(1, 'RIYAD', 187, 6, 8450, '/solo_match.jpg'),
(2, 'SHAKIB*BD', 164, 5, 6200, '/squad_match.jpg'),
(3, 'xXLegendXx', 152, 4, 5750, '/hero_banner.jpg'),
(4, 'TuhinPlayz', 141, 4, 4900, '/solo_match.jpg'),
(5, 'ZihadGaming', 132, 3, 3800, '/squad_match.jpg');

INSERT INTO public.store_products (title, category, price_bdt, original_price_bdt, image, stock, badge) VALUES
('PUBG Mobile 60 UC Top-Up', 'UC_TOPUP', 115, 130, '/solo_match.jpg', 50, 'POPULAR'),
('PUBG Mobile 325 UC Top-Up Pack', 'UC_TOPUP', 570, 620, '/squad_match.jpg', 35, 'BEST VALUE'),
('Royale Pass A8 Upgrade Card', 'ROYALE_PASS', 720, 800, '/hero_banner.jpg', 20, 'NEW SEASON'),
('PUBG Mobile 660 UC Mega Pack', 'UC_TOPUP', 1140, 1250, '/solo_match.jpg', 40, 'HOT');
