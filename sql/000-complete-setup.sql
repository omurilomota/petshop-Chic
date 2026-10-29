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
-- Serviços (catálogo fixo)
INSERT INTO services (id, name, short_name, description, duration_min, price, icon) VALUES
  ('banho', 'Banho', 'Banho', 'Banho completo, secagem cuidadosa e perfume.', 60, 60, 'M7 21h10M12 3v2M8 8c0-2 2-3 4-3s4 1 4 3v8a4 4 0 01-8 0V8z'),
  ('banho-tosa', 'Banho + Tosa', 'Banho + Tosa', 'Banho completo com tosa na tesoura ou máquina.', 120, 110, 'M6 9a3 3 0 100-6 3 3 0 000 6zm0 12a3 3 0 100-6 3 3 0 000 6zM20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12'),
  ('tosa', 'Tosa', 'Tosa', 'Tosa higiênica ou completa, respeitando a raça.', 90, 80, 'M6 9a3 3 0 100-6 3 3 0 000 6zm0 12a3 3 0 100-6 3 3 0 000 6zM20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12'),
  ('consulta', 'Consulta veterinária', 'Consulta', 'Atendimento clínico, vacinação e orientação.', 30, 120, 'M4.5 12.5l7.5 7.5 7.5-7.5a5 5 0 00-7.5-6.6 5 5 0 00-7.5 6.6zM9 13h2l1-2 2 4 1-2h2'),
  ('taxi', 'Taxi dog', 'Taxi dog', 'Buscamos e levamos o seu pet em casa.', 30, 30, 'M3 13l2-5h14l2 5v5H3v-5zm0 0h18M7 18v2M17 18v2M7 14h.01M17 14h.01')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  description = EXCLUDED.description,
  duration_min = EXCLUDED.duration_min,
  price = EXCLUDED.price,
  icon = EXCLUDED.icon;

-- Planos/assinaturas
INSERT INTO plans (id, name, price, baths, grooms, description, benefits) VALUES
  ('banho-em-dia', 'Banho em Dia', 109, 2, 0, '2 banhos por mês para manter o pelo em dia.', ARRAY['2 banhos por mês', 'Prioridade na agenda', '10% off em produtos']),
  ('banho-semanal', 'Banho Semanal', 189, 4, 0, '4 banhos por mês para quem gosta de pet sempre cheiroso.', ARRAY['4 banhos por mês', 'Prioridade na agenda', '15% off em produtos']),
  ('banho-tosa', 'Banho + Tosa', 179, 2, 1, '2 banhos e 1 tosa por mês, com economia no pacote.', ARRAY['2 banhos + 1 tosa', 'Prioridade na agenda', '10% off em produtos'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  baths = EXCLUDED.baths,
  grooms = EXCLUDED.grooms,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits;

-- Seed de dados de exemplo para ChicPets
-- Execute após o 001-schema.sql

-- Clientes de exemplo
INSERT INTO clients (id, name, phone) VALUES
  ('cli-001', 'Ana Silva', '5518999990117'),
  ('cli-002', 'Bruno Santos', '5518999990118'),
  ('cli-003', 'Carla Oliveira', '55189982000001'),
  ('cli-004', 'Diego Lima', '55189982000002'),
  ('cli-005', 'Eduarda Souza', '55189982000003')
ON CONFLICT (id) DO NOTHING;

-- Pets de exemplo
INSERT INTO pets (id, client_id, name, species, breed, size) VALUES
  ('pet-001', 'cli-001', 'Thor', 'dog', 'Golden Retriever', 'large'),
  ('pet-002', 'cli-001', 'Luna', 'cat', 'Gato SRD', 'medium'),
  ('pet-003', 'cli-002', 'Bob', 'dog', 'Poodle', 'small'),
  ('pet-004', 'cli-003', 'Nina', 'dog', 'Labrador', 'medium'),
  ('pet-005', 'cli-004', 'Mel', 'dog', 'Shih Tzu', 'small'),
  ('pet-006', 'cli-005', 'Rex', 'dog', 'SRD', 'large')
ON CONFLICT (id) DO NOTHING;

-- Agendamentos de exemplo (últimos 7 dias + próximos 7)
INSERT INTO appointments (id, client_id, pet_id, service_id, date, start, duration_min, price, status, source) VALUES
  ('apt-001', 'cli-001', 'pet-001', 'banho', '2026-10-20', '09:00', 60, 60, 'completed', 'whatsapp'),
  ('apt-002', 'cli-002', 'pet-003', 'banho-tosa', '2026-10-20', '10:30', 120, 110, 'completed', 'site'),
  ('apt-003', 'cli-003', 'pet-004', 'consulta', '2026-10-21', '08:30', 30, 120, 'completed', 'manual'),
  ('apt-004', 'cli-001', 'pet-001', 'banho', '2026-10-22', '09:00', 60, 60, 'completed', 'whatsapp'),
  ('apt-005', 'cli-004', 'pet-005', 'tosa', '2026-10-23', '14:00', 90, 80, 'completed', 'site'),
  ('apt-006', 'cli-005', 'pet-006', 'banho', '2026-10-24', '09:00', 60, 60, 'confirmed', 'whatsapp'),
  ('apt-007', 'cli-002', 'pet-003', 'banho', '2026-10-24', '10:30', 60, 60, 'scheduled', 'site'),
  ('apt-008', 'cli-003', 'pet-004', 'banho-tosa', '2026-10-25', '09:00', 120, 110, 'scheduled', 'manual'),
  ('apt-009', 'cli-001', 'pet-002', 'consulta', '2026-10-26', '08:30', 30, 120, 'scheduled', 'whatsapp'),
  ('apt-010', 'cli-004', 'pet-005', 'banho', '2026-10-27', '14:00', 60, 60, 'scheduled', 'site')
ON CONFLICT (id) DO NOTHING;

-- Assinaturas de exemplo
INSERT INTO subscriptions (id, client_id, plan_id, started_at, next_billing, status) VALUES
  ('sub-001', 'cli-001', 'banho-em-dia', '2026-09-01', '2026-11-01', 'active'),
  ('sub-002', 'cli-002', 'banho-semanal', '2026-09-15', '2026-10-15', 'active'),
  ('sub-003', 'cli-003', 'banho-tosa', '2026-08-01', '2026-10-01', 'active')
ON CONFLICT (id) DO NOTHING;