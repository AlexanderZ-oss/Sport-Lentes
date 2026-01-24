-- ============================================
-- ACTUALIZACIÓN DE SCHEMA - GALERÍA DE IMÁGENES
-- ============================================
-- Agrega una columna JSONB a la tabla settings para guardar las imágenes de la galería

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
