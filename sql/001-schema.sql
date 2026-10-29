-- Esquema do Supabase para ChicPets
-- Execute este SQL no painel do Supabase (SQL Editor)

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  duration_min INTEGER NOT NULL,
  price INTEGER NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  baths INTEGER NOT NULL DEFAULT 0,
  grooms INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  benefits TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  breed TEXT,
  size TEXT CHECK (size IN ('small', 'medium', 'large'))
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id),
  date DATE NOT NULL,
  start TIME NOT NULL,
  duration_min INTEGER NOT NULL,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'no_show', 'canceled')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('site', 'whatsapp', 'manual', 'referral')),
  notes TEXT,
  needs_taxi BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  started_at DATE NOT NULL,
  next_billing DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'canceled'))
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email', 'in_app')),
  message TEXT,
  appointment_id TEXT REFERENCES appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id TEXT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grants: permitir acesso às roles do Supabase
GRANT ALL ON TABLE services TO anon, authenticated, service_role;
GRANT ALL ON TABLE plans TO anon, authenticated, service_role;
GRANT ALL ON TABLE clients TO anon, authenticated, service_role;
GRANT ALL ON TABLE pets TO anon, authenticated, service_role;
GRANT ALL ON TABLE appointments TO anon, authenticated, service_role;
GRANT ALL ON TABLE subscriptions TO anon, authenticated, service_role;
GRANT ALL ON TABLE contacts TO anon, authenticated, service_role;
GRANT ALL ON TABLE feedbacks TO anon, authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_pets_client ON pets(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_contacts_client ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_client ON feedbacks(client_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS appointments_updated_at ON appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Habilitar RLS em todas as tabelas
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- RLS: políticas de segurança
-- Services e plans: leitura pública
DROP POLICY IF EXISTS "services_read_all" ON services;
CREATE POLICY "services_read_all" ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS "plans_read_all" ON plans;
CREATE POLICY "plans_read_all" ON plans FOR SELECT USING (true);

-- Clientes: anon pode inserir (agendamento público), autenticado pode tudo
DROP POLICY IF EXISTS "clients_insert_anon" ON clients;
CREATE POLICY "clients_insert_anon" ON clients FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "clients_auth_all" ON clients;
CREATE POLICY "clients_auth_all" ON clients FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Pets: anon pode inserir, autenticado pode tudo
DROP POLICY IF EXISTS "pets_insert_anon" ON pets;
CREATE POLICY "pets_insert_anon" ON pets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "pets_auth_all" ON pets;
CREATE POLICY "pets_auth_all" ON pets FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Appointments: anon pode inserir, autenticado pode tudo
DROP POLICY IF EXISTS "appointments_insert_anon" ON appointments;
CREATE POLICY "appointments_insert_anon" ON appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_auth_all" ON appointments;
CREATE POLICY "appointments_auth_all" ON appointments FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Subscriptions, contacts, feedbacks: apenas autenticado
DROP POLICY IF EXISTS "subscriptions_auth_all" ON subscriptions;
CREATE POLICY "subscriptions_auth_all" ON subscriptions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "contacts_auth_all" ON contacts;
CREATE POLICY "contacts_auth_all" ON contacts FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "feedbacks_auth_all" ON feedbacks;
CREATE POLICY "feedbacks_auth_all" ON feedbacks FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
