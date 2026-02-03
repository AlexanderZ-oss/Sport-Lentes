# 🔧 SOLUCIÓN: No aparecen usuarios en la página

## 📋 Problema
No se muestran los usuarios activos, usuarios creados, ni usuarios en línea en la página de Usuarios.

## ✅ Correcciones Aplicadas

He corregido el código que estaba causando este problema:

1. **Función seedUsers mejorada**: Ahora refresca correctamente la lista después de insertar usuarios
2. **Mejor manejo de errores**: Más logs para debugging
3. **Actualización automática de lista**: Los usuarios se cargan correctamente al iniciar

## 🚀 PASOS PARA VERIFICAR

### Opción 1: Verificación Automática (RECOMENDADO)

1. **Abre la aplicación en tu navegador**
2. **Presiona F12** para abrir Developer Tools
3. **Ve a la pestaña Console**
4. **Copia y pega el contenido de** `verificar-usuarios.js`
5. **Presiona Enter**
6. **Lee los resultados**

El script te dirá:
- ✅ Si hay usuarios en Supabase
- ✅ Cuántos usuarios hay
- ✅ Si hay problemas de conexión
- 🔧 Cómo solucionarlo si hay problemas

### Opción 2: Verificación Manual

#### 1. Verificar en Supabase Dashboard

1. Ve a **https://supabase.com/dashboard**
2. Selecciona tu proyecto **sport-lentes**
3. Ve a **Table Editor** → **users**
4. Verifica que haya usuarios en la tabla

**¿Tabla vacía?** → Ejecuta el script SQL de abajo

#### 2. Insertar Usuarios Manualmente (Si la tabla está vacía)

**En Supabase SQL Editor:**

```sql
-- Insertar usuarios por defecto
INSERT INTO users (id, username, password, name, role, status)
VALUES 
    ('27c4fb4e-5e36-479e-a6a9-826315848201', 'sportlents@gmail.com', '123', 'Super Admin Sport Lentes', 'admin', 'active'),
    ('27c4fb4e-5e36-479e-a6a9-826315848202', 'admin', '123', 'Administrador Sport', 'admin', 'active'),
    ('27c4fb4e-5e36-479e-a6a9-826315848203', 'empleado', '123', 'Empleado Ventas', 'employee', 'active')
ON CONFLICT (id) DO NOTHING;
```

#### 3. Verificar Políticas RLS

**En Supabase SQL Editor:**

```sql
-- Ver políticas de la tabla users
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Si no hay políticas o están mal configuradas, ejecutar:
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON users;
DROP POLICY IF EXISTS "Enable update access for all users" ON users;
DROP POLICY IF EXISTS "Enable delete access for all users" ON users;

-- Crear políticas abiertas
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (true);
```

## 🔍 DIAGNÓSTICO DE PROBLEMAS COMUNES

### Problema 1: "La tabla está vacía"

**Solución:**
1. Ejecuta el script SQL de inserción de usuarios (arriba)
2. O espera a que la app inserte automáticamente los usuarios por defecto
3. Recarga la página (F5)

### Problema 2: "Error de conexión a Supabase"

**Solución:**
1. Verifica que el proyecto de Supabase esté activo
2. Verifica las credenciales en `.env`:
   ```
   VITE_SUPABASE_URL=https://umkztstvkbhghlkimsip.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
3. Verifica que no haya problemas de red

### Problema 3: "Los usuarios no aparecen en la interfaz"

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca mensajes como:
   - `"Users loaded from Supabase: X users"`
   - `"Seeding default users..."`
3. Si ves errores, copia el mensaje y revisa

### Problema 4: "Error de políticas RLS"

**Solución:**
1. Ejecuta el script `fix-rls-policies.sql` completo en Supabase
2. Verifica que las políticas se crearon correctamente
3. Recarga la página

## 📊 LOGS DE DEBUG

En la consola del navegador deberías ver:

```
Users loaded from Supabase: 3 users
✅ AUTH SUPABASE OK
```

Si ves:
```
Table is empty, seeding default users...
Default users seeded successfully: [...]
```
Entonces los usuarios se están insertando automáticamente.

## 🛠️ SOLUCIÓN RÁPIDA DE EMERGENCIA

Si nada funciona, ejecuta esto en la consola del navegador:

```javascript
// Limpiar todo y recargar
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Luego ejecuta el script `verificar-usuarios.js` de nuevo.

## ✅ VERIFICACIÓN FINAL

Después de aplicar las soluciones:

1. ✅ Ve a la página de **Usuarios** en la app
2. ✅ Deberías ver una tabla con al menos 3 usuarios:
   - Super Admin Sport Lentes (sportlents@gmail.com)
   - Administrador Sport (admin)
   - Empleado Ventas (empleado)
3. ✅ Cada usuario debe mostrar:
   - Nombre
   - Usuario
   - Rol (ADMIN o EMPLOYEE)
   - Estado (Activo/Suspendido)
   - Botones de acción (Editar, Suspender, Eliminar)

## 🆘 SI TODAVÍA NO FUNCIONA

1. **Ejecuta** `verificar-usuarios.js` en la consola
2. **Copia** el output completo
3. **Revisa** los mensajes de error
4. **Verifica** que ejecutaste el script SQL en Supabase
5. **Recarga** la página (F5)

## 📝 NOTAS IMPORTANTES

- Los cambios ya están en GitHub (`commit 8d11c75`)
- El build se completó exitosamente (33.87s)
- La función seedUsers ahora funciona correctamente
- Los usuarios se insertan automáticamente si la tabla está vacía
- Las políticas RLS deben estar configuradas (ver `fix-rls-policies.sql`)

---

**Última actualización:** 2026-02-03  
**Commit:** 8d11c75  
**Status:** ✅ Corregido y desplegado
