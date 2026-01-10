# ⚡ INICIO RÁPIDO - Configuración Supabase

## 🎯 Configuración en 5 Pasos (10 minutos)

### Paso 1: Crear Proyecto Supabase (3 min)

1. Abre: [https://supabase.com](https://supabase.com)
2. Click en **"Start your project"** o **"Sign In"**
3. Inicia sesión con GitHub o email
4. Click en **"New Project"**
5. Completa:
   - **Name:** `sport-lentes`
   - **Database Password:** (crea una contraseña segura y guárdala) 
   - **Region:** `South America (São Paulo)`
   - **Pricing Plan:** Free
6. Click en **"Create new project"**
7. ⏳ Espera 1-2 minutos mientras se crea

### Paso 2: Ejecutar Script SQL (2 min)

1. En tu proyecto de Supabase, click en **"SQL Editor"** (menú izquierdo)
2. Click en **"New query"**
3. Abre el archivo `supabase-schema.sql` de este proyecto
4. Copia TODO el contenido (Ctrl+A, Ctrl+C)
5. Pégalo en el SQL Editor de Supabase (Ctrl+V)
6. Click en **"Run"** (o presiona Ctrl+Enter)
7. ✅ Deberías ver: **"Success. No rows returned"**

### Paso 3: Obtener Credenciales (1 min)

1. Click en **"Settings"** (⚙️ icono de configuración en el menú izquierdo)
2. Click en **"API"**
3. Copia estos dos valores:

```
Project URL: https://xxxxxxxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 4: Configurar Variables de Entorno (1 min)

1. En la raíz de este proyecto, crea un archivo llamado `.env` (sin extensión)
2. Pega esto (reemplaza con tus valores):

```bash
VITE_SUPABASE_URL=https://tu-proyecto-aqui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...tu-clave-aqui...
```

3. Guarda el archivo (Ctrl+S)

### Paso 5: Iniciar Aplicación (1 min)

```bash
npm run dev
```

Abre: [http://localhost:5173](http://localhost:5173)

---

## ✅ Verificar que Funciona

1. **Mira la esquina inferior derecha de la página**
   - ✅ Debe decir: **"● SUPABASE EN LÍNEA"** (verde)
   - ❌ Si dice error, revisa el paso 4

2. **Agrega un producto de prueba**
   - Ve a "Inventario" → "Agregar Producto"
   - Llena los campos
   - Click en "Agregar"

3. **Verifica en Supabase**
   - Abre tu proyecto de Supabase
   - Ve a **"Table Editor"** → **"products"**
   - ✅ Deberías ver el producto que acabas de crear

---

## 🎉 ¡Listo!

Tu aplicación ahora está usando Supabase. Todo lo demás funciona exactamente igual que antes.

---

## ❌ Si algo falla

### Error: "Missing environment variables"
- Verifica que el archivo `.env` esté en la raíz del proyecto
- Asegúrate de que las variables empiecen con `VITE_`
- Reinicia el servidor (`Ctrl+C` y `npm run dev` de nuevo)

### Error: "Failed to fetch"
- Verifica que copiaste bien la URL y la clave
- Asegúrate de que no haya espacios extra
- Verifica que el proyecto de Supabase esté activo

### Error: "Relation 'products' does not exist"
- Vuelve al Paso 2 y ejecuta el script SQL completo
- Verifica en **Table Editor** que las tablas estén creadas

---

## 📚 Más Información

- **Guía completa:** Ver `SUPABASE_SETUP.md`
- **Resumen de cambios:** Ver `MIGRATION_SUMMARY.md`
- **Documentación:** [https://supabase.com/docs](https://supabase.com/docs)
