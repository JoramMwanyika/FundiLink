CREATE TABLE IF NOT EXISTS fundis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  categories TEXT[] NOT NULL,
  location TEXT,
  rating DECIMAL(3,2),
  is_verified BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fundis_categories ON fundis USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_fundis_location ON fundis(location);
CREATE INDEX IF NOT EXISTS idx_fundis_is_verified ON fundis(is_verified);
CREATE INDEX IF NOT EXISTS idx_fundis_available ON fundis(available); 