-- Migration initiale : création des tables pour CagnottePro
-- Exécuter ce script dans l'éditeur SQL de votre projet Supabase

-- ============================================================
-- Table : cagnottes
-- ============================================================
CREATE TABLE IF NOT EXISTS cagnottes (
  id          TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL,
  goal        NUMERIC     NOT NULL DEFAULT 0,
  currency    TEXT        NOT NULL DEFAULT 'GNF',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table : contributions
-- ============================================================
CREATE TABLE IF NOT EXISTS contributions (
  id           TEXT        PRIMARY KEY,
  cagnotte_id  TEXT        NOT NULL REFERENCES cagnottes(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  amount       NUMERIC     NOT NULL DEFAULT 0,
  date         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contributions_cagnotte_id_idx ON contributions (cagnotte_id);

-- ============================================================
-- Table : expenses (dépenses)
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id           TEXT        PRIMARY KEY,
  cagnotte_id  TEXT        NOT NULL REFERENCES cagnottes(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  amount       NUMERIC     NOT NULL DEFAULT 0,
  date         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expenses_cagnotte_id_idx ON expenses (cagnotte_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
-- RLS est désactivé par défaut pour simplifier le démarrage.
-- Pour activer RLS et restreindre l'accès par utilisateur authentifié,
-- décommentez les lignes suivantes et adaptez les politiques à vos besoins :
--
-- ALTER TABLE cagnottes    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses      ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Accès public en lecture"  ON cagnottes    FOR SELECT USING (true);
-- CREATE POLICY "Accès public en écriture" ON cagnottes    FOR ALL    USING (true);
-- CREATE POLICY "Accès public en lecture"  ON contributions FOR SELECT USING (true);
-- CREATE POLICY "Accès public en écriture" ON contributions FOR ALL    USING (true);
-- CREATE POLICY "Accès public en lecture"  ON expenses      FOR SELECT USING (true);
-- CREATE POLICY "Accès public en écriture" ON expenses      FOR ALL    USING (true);
