-- ============================================
-- SPORT LENTES - SUPABASE DATABASE SCHEMA
-- ============================================
-- Run these commands in Supabase SQL Editor
-- https://app.supabase.com/project/_/sql

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Ventas
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    seller_id VARCHAR(255) NOT NULL,
    seller_name VARCHAR(255) NOT NULL,
    client JSONB,
    sale_type VARCHAR(50),
    discount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Logs de Actividad
CREATE TABLE IF NOT EXISTS logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "user" VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Configuración
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(50) PRIMARY KEY,
    ruc VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_seller ON sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user ON logs("user");
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE POLICIES (Public Access for now)
-- ============================================
-- NOTE: For production, you should create proper authentication
-- and more restrictive policies

-- Products Policies
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON products
    FOR DELETE USING (true);

-- Sales Policies
CREATE POLICY "Enable read access for all users" ON sales
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON sales
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON sales
    FOR DELETE USING (true);

-- Logs Policies
CREATE POLICY "Enable read access for all users" ON logs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON logs
    FOR DELETE USING (true);

-- Users Policies
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON users
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON users
    FOR DELETE USING (true);

-- Settings Policies
CREATE POLICY "Enable read access for all users" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Enable update access for all users" ON settings
    FOR UPDATE USING (true);

CREATE POLICY "Enable insert access for all users" ON settings
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 5. CREATE FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for settings
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. INSERT DEFAULT DATA
-- ============================================

-- Insert default configuration
INSERT INTO settings (id, ruc, address, phone, name)
VALUES (
    'app_config',
    '20601234567',
    'Av. Principal 123, Ciudad',
    '+51 951 955 969',
    'Sport Lentes'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. ENABLE REALTIME (Optional but recommended)
-- ============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE sales;
ALTER PUBLICATION supabase_realtime ADD TABLE logs;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Go to https://app.supabase.com/project/_/settings/api
-- 2. Copy your project URL and anon key
-- 3. Add them to your .env file as:
--    VITE_SUPABASE_URL=your-project-url
--    VITE_SUPABASE_ANON_KEY=your-anon-key
-- 4. Update your App.tsx to use SupabaseDataProvider
