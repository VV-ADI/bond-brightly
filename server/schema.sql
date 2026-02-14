-- Bond Brightly Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ─── Profiles Table ───
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  age TEXT,
  birthday TEXT,
  bio TEXT,
  profile_picture TEXT,
  interests TEXT[] DEFAULT '{}',
  hobbies TEXT[] DEFAULT '{}',
  personal_answers JSONB DEFAULT '[]',
  question_time TEXT DEFAULT '20:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Friendships Table ───
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'Friends',
  status TEXT DEFAULT 'accepted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ─── Messages Table ───
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Daily Answers Table ───
CREATE TABLE IF NOT EXISTS daily_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ───
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_daily_answers_user ON daily_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_answers_date ON daily_answers(answered_at);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ─── Row Level Security ───
-- NOTE: Since the backend server uses the anon key (not service_role),
-- we use permissive policies. The server validates all requests.
-- For production, use the service_role key on the server instead.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_answers ENABLE ROW LEVEL SECURITY;

-- Profiles: allow all operations (server validates)
CREATE POLICY "Allow all profile operations" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Friendships: allow all operations (server validates)
CREATE POLICY "Allow all friendship operations" ON friendships
  FOR ALL USING (true) WITH CHECK (true);

-- Messages: allow all operations (server validates)
CREATE POLICY "Allow all message operations" ON messages
  FOR ALL USING (true) WITH CHECK (true);

-- Daily Answers: allow all operations (server validates)
CREATE POLICY "Allow all answer operations" ON daily_answers
  FOR ALL USING (true) WITH CHECK (true);

-- ─── Enable Realtime ───
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_answers;
