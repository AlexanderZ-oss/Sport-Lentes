-- ============================================
-- DIAGNÓSTICO Y CORRECCIÓN DE POLÍTICAS RLS
-- Sport Lentes - Supabase
-- ============================================
-- Ejecuta este script en Supabase SQL Editor para garantizar
-- que todas las políticas RLS estén correctas.
--
-- IMPORTANTE: NO alterará los datos, solo las políticas de acceso.
-- ============================================

-- ============================================
-- PASO 1: ELIMINAR POLÍTICAS EXISTENTES
-- ============================================

-- Eliminar políticas de products
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON products;
DROP POLICY IF EXISTS "Enable update access for all users" ON products;
DROP POLICY IF EXISTS "Enable delete access for all users" ON products;

-- Eliminar políticas de sales
DROP POLICY IF EXISTS "Enable read access for all users" ON sales;
DROP POLICY IF EXISTS "Enable insert access for all users" ON sales;
DROP POLICY IF EXISTS "Enable delete access for all users" ON sales;

-- Eliminar políticas de logs
DROP POLICY IF EXISTS "Enable read access for all users" ON logs;
DROP POLICY IF EXISTS "Enable insert access for all users" ON logs;
DROP POLICY IF EXISTS "Enable delete access for all users" ON logs;

-- Eliminar políticas de users
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON users;
DROP POLICY IF EXISTS "Enable update access for all users" ON users;
DROP POLICY IF EXISTS "Enable delete access for all users" ON users;

-- Eliminar políticas de settings
DROP POLICY IF EXISTS "Enable read access for all users" ON settings;
DROP POLICY IF EXISTS "Enable update access for all users" ON settings;
DROP POLICY IF EXISTS "Enable insert access for all users" ON settings;

-- ============================================
-- PASO 2: DESHABILITAR RLS TEMPORALMENTE
-- ============================================
-- Esto garantiza acceso completo durante la transición

ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 3: RE-HABILITAR RLS Y CREAR POLÍTICAS ABIERTAS
-- ============================================
-- Estas políticas permiten acceso completo sin autenticación

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_policy" ON products
    FOR SELECT USING (true);

CREATE POLICY "products_insert_policy" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "products_update_policy" ON products
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "products_delete_policy" ON products
    FOR DELETE USING (true);

-- SALES
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sales_select_policy" ON sales
    FOR SELECT USING (true);

CREATE POLICY "sales_insert_policy" ON sales
    FOR INSERT WITH CHECK (true);

CREATE POLICY "sales_delete_policy" ON sales
    FOR DELETE USING (true);

-- LOGS
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logs_select_policy" ON logs
    FOR SELECT USING (true);

CREATE POLICY "logs_insert_policy" ON logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "logs_delete_policy" ON logs
    FOR DELETE USING (true);

-- USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (true);

CREATE POLICY "users_insert_policy" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "users_delete_policy" ON users
    FOR DELETE USING (true);

-- SETTINGS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_policy" ON settings
    FOR SELECT USING (true);

CREATE POLICY "settings_insert_policy" ON settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "settings_update_policy" ON settings
    FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================
-- PASO 4: VERIFICAR CONFIGURACIÓN
-- ============================================

-- Ver todas las políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar estado de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'sales', 'logs', 'users', 'settings');

-- ============================================
-- PASO 5: VERIFICAR CONFIGURACIÓN DE AUTENTICACIÓN
-- ============================================

-- Verificar si hay usuarios en el sistema de auth de Supabase
-- (No debería haber ninguno ya que usamos nuestro propio sistema)
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
LIMIT 10;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- ✅ Todas las tablas deben tener RLS habilitado (rowsecurity = true)
-- ✅ Cada tabla debe tener 3-4 políticas (SELECT, INSERT, UPDATE, DELETE)
-- ✅ Todas las políticas deben usar 'true' como condición
-- ✅ No debe haber usuarios en auth.users (o muy pocos)
-- ============================================

-- ============================================
-- SOLUCIÓN DE PROBLEMAS ADICIONAL
-- ============================================

-- Si todavía hay problemas, ejecuta lo siguiente para deshabilitar
-- completamente RLS (solo para desarrollo):

-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE logs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- NOTA: Esto NO es recomendado para producción, solo para debugging.
