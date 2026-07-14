/*
# Enterprise Upgrade - Security Tools & AI Assistant Tables

## Overview
Adds tables for:
- Scan history (records of all security tool scans)
- AI chat conversations and messages
- Security news articles

## New Tables
1. `scan_history` - Records of security tool scans with results
2. `ai_conversations` - AI assistant conversation sessions
3. `ai_messages` - Individual messages within conversations
4. `security_news` - Curated security news articles

## Security
- RLS enabled on all tables
- Owner-scoped for scan history and AI conversations
- Public read for security news
*/

-- ============ SCAN HISTORY ============
CREATE TABLE IF NOT EXISTS scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  tool_type text NOT NULL,
  target text NOT NULL,
  result jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scan_history_select" ON scan_history;
CREATE POLICY "scan_history_select" ON scan_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "scan_history_insert" ON scan_history;
CREATE POLICY "scan_history_insert" ON scan_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scan_history_delete" ON scan_history;
CREATE POLICY "scan_history_delete" ON scan_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_scan_history_user ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_tool ON scan_history(tool_type);
CREATE INDEX IF NOT EXISTS idx_scan_history_created ON scan_history(created_at DESC);

-- ============ AI CONVERSATIONS ============
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_conversations_select" ON ai_conversations;
CREATE POLICY "ai_conversations_select" ON ai_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_conversations_insert" ON ai_conversations;
CREATE POLICY "ai_conversations_insert" ON ai_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_conversations_update" ON ai_conversations;
CREATE POLICY "ai_conversations_update" ON ai_conversations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_conversations_delete" ON ai_conversations;
CREATE POLICY "ai_conversations_delete" ON ai_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ AI MESSAGES ============
CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_messages_select" ON ai_messages;
CREATE POLICY "ai_messages_select" ON ai_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "ai_messages_insert" ON ai_messages;
CREATE POLICY "ai_messages_insert" ON ai_messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "ai_messages_delete" ON ai_messages;
CREATE POLICY "ai_messages_delete" ON ai_messages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);

-- ============ SECURITY NEWS ============
CREATE TABLE IF NOT EXISTS security_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE security_news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "security_news_select" ON security_news;
CREATE POLICY "security_news_select" ON security_news FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "security_news_insert" ON security_news;
CREATE POLICY "security_news_insert" ON security_news FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

DROP POLICY IF EXISTS "security_news_delete" ON security_news;
CREATE POLICY "security_news_delete" ON security_news FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor'))
  );

CREATE INDEX IF NOT EXISTS idx_security_news_published ON security_news(published_at DESC);

-- ============ TRIGGERS ============
DROP TRIGGER IF EXISTS ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ SEED SECURITY NEWS ============
INSERT INTO security_news (title, summary, source, url, category, published_at) VALUES
('Critical Zero-Day Vulnerability in Popular Web Framework', 'A critical remote code execution vulnerability has been discovered affecting millions of applications worldwide. Patch immediately.', 'Security Weekly', 'https://example.com/news/zeroday-1', 'vulnerability', now() - interval '1 day'),
('New Ransomware Campaign Targets Healthcare Sector', 'Security researchers identify a coordinated ransomware campaign specifically targeting healthcare infrastructure across multiple countries.', 'Threat Post', 'https://example.com/news/ransomware-1', 'malware', now() - interval '2 days'),
('Major SSL/TLS Vulnerability Discovered in OpenSSL', 'A new high-severity vulnerability in OpenSSL could allow attackers to decrypt traffic. Update your servers now.', 'Krebs on Security', 'https://example.com/news/openssl-vuln', 'vulnerability', now() - interval '3 days'),
('FBI Warns of Increasing Phishing Attacks Using AI', 'The FBI has issued a warning about sophisticated phishing campaigns leveraging AI to create convincing fake emails and websites.', 'CISA', 'https://example.com/news/ai-phishing', 'threat', now() - interval '4 days'),
('New OWASP Top 10 Released for 2025', 'The Open Web Application Security Project has updated its Top 10 list of critical web application security risks.', 'OWASP', 'https://example.com/news/owasp-2025', 'general', now() - interval '5 days'),
('Critical Infrastructure Under Attack: Water Treatment Facilities Targeted', 'Multiple water treatment facilities report attempted cyber attacks, raising concerns about critical infrastructure security.', 'Dark Reading', 'https://example.com/news/water-attacks', 'threat', now() - interval '6 days'),
('New Cryptographic Standard Announced by NIST', 'NIST has officially announced the new post-quantum cryptographic standards designed to resist attacks from quantum computers.', 'NIST', 'https://example.com/news/nist-pqc', 'cryptography', now() - interval '7 days'),
('Supply Chain Attack Compromises Popular npm Package', 'A widely-used npm package was compromised with malicious code, potentially affecting thousands of JavaScript applications.', 'The Hacker News', 'https://example.com/news/npm-supply-chain', 'supply-chain', now() - interval '8 days')
ON CONFLICT DO NOTHING;