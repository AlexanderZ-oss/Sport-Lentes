-- SQL para permitir códigos duplicados y hacer que el nombre sea único en la tabla de productos

-- 1. Eliminar la restricción de unicidad del código
-- Nota: En PostgreSQL/Supabase, la restricción creada con UNIQUE suele llamarse 'products_code_key'
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_code_key;

-- 2. Asegurarse de que no haya un índice único que esté bloqueando
DROP INDEX IF EXISTS idx_products_code_unique;

-- 3. Crear el índice para rendimiento (pero no único) si no existe
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);

-- 4. Hacer que el nombre sea único
-- Primero limpiamos posibles duplicados de nombres si existen (opcional, pero recomendado)
-- En este caso, el usuario dice que ya no le deja registrar más de uno, así que probablemente no tenga muchos datos aún.

-- Intentar agregar la restricción de unicidad al nombre
ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);
