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