# 🚀 Guía de Configuración - Supabase para Sport Lentes

## ¿Por qué Supabase?

Hemos migrado de Firebase a Supabase debido a problemas persistentes de conexión. Supabase ofrece:

- ✅ Mayor estabilidad y confiabilidad
- ✅ Base de datos PostgreSQL robusta
- ✅ API REST automática
- ✅ Tiempo real sin configuración compleja
- ✅ Panel de administración intuitivo
- ✅ Tier gratuito muy generoso (500MB, 2GB bandwidth)
- ✅ Mejor documentación y soporte

---

## 📋 Pasos de Configuración

### 1. Crear una cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub o tu email

### 2. Crear un nuevo proyecto

1. Haz clic en "New Project"
2. Elige un nombre para tu proyecto (ej: `sport-lentes`)
3. Crea una contraseña segura para la base de datos (¡guárdala!)
4. Selecciona la región más cercana (ej: South America - São Paulo)
5. Espera 1-2 minutos mientras se crea el proyecto

### 3. Configurar la base de datos

1. Una vez creado el proyecto, ve a la sección **SQL Editor** en el menú izquierdo
2. Haz clic en "New query"
3. Copia todo el contenido del archivo `supabase-schema.sql`
4. Pégalo en el editor SQL
5. Haz clic en "Run" (o presiona Ctrl+Enter)
6. Verifica que aparezca "Success. No rows returned" (esto es normal)

### 4. Obtener las credenciales

1. Ve a **Settings** → **API** en el menú izquierdo
2. Encontrarás dos valores importantes:
   - **Project URL**: algo como `https://xxxxxxxxxxx.supabase.co`
   - **anon public key**: una clave larga que empieza con `eyJ...`

### 5. Configurar las variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Agrega estas líneas con tus credenciales reales:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

**Ejemplo:**
```bash
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjcwMDAwMDAsImV4cCI6MTk3MjYwMDAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6. Actualizar el código

Abre `src/App.tsx` y cambia el provider de Firebase a Supabase:

**ANTES:**
```tsx
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      {/* ... resto del código */}
    </DataProvider>
  );
}
```

**DESPUÉS:**
```tsx
import { SupabaseDataProvider } from './context/SupabaseDataContext';

function App() {
  return (
    <SupabaseDataProvider>
      {/* ... resto del código */}
    </SupabaseDataProvider>
  );
}
```

### 7. Probar la conexión

1. Guarda todos los archivos
2. Ejecuta el proyecto:
   ```bash
   npm run dev
   ```
3. Abre la aplicación en el navegador
4. En la esquina inferior derecha deberías ver:
   - **"● SUPABASE EN LÍNEA"** (verde) = Todo funciona ✅
   - **"○ SINCRONIZANDO..."** (azul) = Conectando...
   - **"✖ ERROR DE RED"** (rojo) = Hay un problema ❌

---

## 🔍 Verificar que todo funciona

### Opción 1: Desde la aplicación
1. Agrega un producto de prueba
2. Ve al panel de Supabase → Table Editor → `products`
3. Deberías ver el producto que acabas de crear

### Opción 2: Desde Supabase
1. Ve a Table Editor → `products`
2. Haz clic en "Insert row"
3. Agrega un producto manualmente
4. Vuelve a tu aplicación y deberías verlo aparecer automáticamente (tiempo real!)

---

## 🎯 Características habilitadas

- ✅ **Sincronización en tiempo real**: Los cambios se reflejan instantáneamente
- ✅ **Persistencia local**: Los datos se guardan en localStorage como backup
- ✅ **Modo offline**: La app funciona aunque se pierda la conexión
- ✅ **Indicador de estado**: Siempre sabes si estás conectado
- ✅ **Auto-reconexión**: Se reconecta automáticamente

---

## ⚠️ Solución de problemas

### Error: "Failed to fetch"
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el proyecto de Supabase esté activo
- Revisa que no haya bloqueadores de contenido o firewall

### Error: "Connection timed out"
- Verifica tu conexión a internet
- Prueba con otra red
- El servidor de Supabase podría estar en mantenimiento (poco común)

### No veo los datos en tiempo real
- Verifica que ejecutaste todo el script SQL
- Ve a Database → Replication en Supabase
- Asegúrate de que las tablas estén en la lista de "Realtime enabled tables"

### Los datos no se guardan
- Revisa la consola del navegador (F12) para ver errores
- Verifica las políticas RLS en Supabase (deberían permitir todo para desarrollo)
- Asegúrate de que ejecutaste el script completo de políticas

---

## 📊 Monitorear el uso

1. Ve a **Settings** → **Usage** en Supabase
2. Aquí puedes ver:
   - Espacio de base de datos usado
   - Transferencia de datos (bandwidth)
   - Número de usuarios autenticados
   - Solicitudes API

El tier gratuito incluye:
- 500 MB de base de datos
- 2 GB de transferencia de datos/mes
- 50,000 usuarios autenticados

Para una tienda pequeña, esto es más que suficiente.

---

## 🔐 Seguridad para producción

**IMPORTANTE:** Las políticas actuales permiten acceso completo a todos. Para producción:

1. Implementa autenticación de Supabase
2. Actualiza las políticas RLS para verificar roles
3. Agrega validación de datos
4. Habilita autenticación de dos factores en tu cuenta de Supabase

Ejemplo de política más segura:
```sql
-- Solo usuarios autenticados pueden insertar productos
CREATE POLICY "Authenticated users can insert" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## 📞 Soporte

- Documentación: [https://supabase.com/docs](https://supabase.com/docs)
- Discord: [https://discord.supabase.com](https://discord.supabase.com)
- GitHub: [https://github.com/supabase/supabase](https://github.com/supabase/supabase)

---

## 🎉 ¡Listo!

Tu aplicación ahora está usando Supabase como base de datos. Disfruta de una conexión más confiable y estable.

Si tienes algún problema, revisa la consola del navegador (F12) y la sección de logs en Supabase.
