# 📚 Guía de Desarrollo - Sport Lentes

---

## ⚠️ IMPORTANTE: CONFIGURACIÓN DE BASE DE DATOS

Esta aplicación ahora usa **Supabase** como base de datos (migrado desde Firebase).

**👉 ANTES DE INICIAR, debes configurar Supabase:**

1. Lee la guía completa en **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**
2. Crea tu proyecto en [supabase.com](https://supabase.com)
3. Ejecuta el script SQL en `supabase-schema.sql`
4. Configura tus credenciales en el archivo `.env`

Sin este paso, la aplicación NO funcionará correctamente.

---

## 🔧 PROBLEMA RESUELTO: Acceso con Diferentes Cuentas

**Si la aplicación solo funciona con una cuenta específica:**

✅ **Este problema ha sido CORREGIDO** en la última actualización.

📖 **Lee las instrucciones completas en:** [INSTRUCCIONES_RAPIDAS.md](./INSTRUCCIONES_RAPIDAS.md)

**Resumen de la solución:**
1. Ejecuta el script SQL en `fix-rls-policies.sql` en Supabase
2. Limpia las sesiones del navegador con `clear-sessions.js`
3. Actualiza la página

Para diagnóstico automático, ejecuta `diagnostico.js` en la consola del navegador.

---

## 🚀 Inicio Rápido

### 1. Instalación
```bash
npm install
```

### 2. Configurar Base de Datos
Sigue las instrucciones en **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

### 3. Desarrollo
```bash
npm run dev
```
Abre [http://localhost:5173](http://localhost:5173)

### 4. Construcción para Producción
```bash
npm run build
```

### 5. Preview de Producción
```bash
npm run preview
```

## 🔐 Credenciales por Defecto

### Administrador
- **Usuario**: `admin`
- **Contraseña**: `123`

### Empleado
- **Usuario**: `empleado`
- **Contraseña**: `123`

---

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── BarcodeScanner.tsx
│   └── Logo.tsx
├── constants/        # Constantes y configuración
│   └── index.ts
├── context/          # Gestión de estado global
│   ├── AuthContext.tsx
│   └── DataContext.tsx
├── pages/            # Páginas de la aplicación
│   ├── Dashboard.tsx
│   ├── Inventory.tsx
│   ├── LandingPage.tsx
│   ├── Login.tsx
│   ├── Monitoring.tsx
│   ├── Reports.tsx
│   ├── Sales.tsx
│   └── Users.tsx
├── utils/            # Funciones utilitarias
│   ├── formatters.ts
│   └── pdfGenerator.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🎯 Funcionalidades Principales

### 1. **Gestión de Ventas**
- Búsqueda de productos
- Escaneo de códigos de barras (USB y cámara)
- Carrito de compras
- Ventas unitarias y mayoristas
- Descuentos manuales
- IGV opcional
- Generación de boletas PDF

### 2. **Gestión de Inventario**
- Agregar productos con imágenes
- Actualizar stock
- Ver productos con filtros
- Escaneo de códigos

### 3. **Reportes y Análisis** (Solo Admin)
- Dashboard financiero
- Gráficos de ventas
- Exportación a PDF
- Limpiar datos históricos

### 4. **Gestión de Usuarios** (Solo Admin)
- Crear usuarios
- Activar/Desactivar
- Eliminar usuarios

### 5. **Monitoreo** (Solo Admin)
- Registro de actividades
- Historial de acciones

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Context API** - State management
- **React Router** - Navegación
- **Recharts** - Gráficos
- **jsPDF** - Generación de PDFs
- **html5-qrcode** - Escaneo de códigos

### Backend / Base de Datos
- **Supabase** - Base de datos PostgreSQL en la nube
  - Sincronización en tiempo real
  - API REST automática
  - Autenticación integrada
  - Almacenamiento de archivos

---

## 📝 Guías de Desarrollo

### Agregar un Nuevo Módulo

1. **Crear el componente de página**
   ```typescript
   // src/pages/NuevoModulo.tsx
   import React from 'react';
   
   const NuevoModulo: React.FC = () => {
     return <div>Contenido</div>;
   };
   
   export default NuevoModulo;
   ```

2. **Agregar al Dashboard**
   ```typescript
   // src/pages/Dashboard.tsx
   import NuevoModulo from './NuevoModulo';
   
   // Agregar en renderModule()
   case 'nuevo': return <NuevoModulo />;
   ```

3. **Agregar navegación en sidebar**
   ```typescript
   <li onClick={() => setActiveTab('nuevo')}>
     <span>🆕</span> Nuevo Módulo
   </li>
   ```

### Agregar Nuevas Constantes

```typescript
// src/constants/index.ts
export const MI_CONSTANTE = 'valor';
```

### Crear Utility Functions

```typescript
// src/utils/miUtility.ts
export const miFuncion = (param: string): string => {
  return param.toUpperCase();
};
```

---

## 🔧 Configuración

### Modificar Credenciales
Edita `src/constants/index.ts`:
```typescript
export const DEFAULT_USERS = [
  { username: 'admin', password: 'nuevaContraseña', ... }
];
```

### Cambiar Información de la Empresa
Edita `src/constants/index.ts`:
```typescript
export const APP_CONFIG = {
  NAME: 'Tu Empresa',
  RUC: 'TuRUC',
  // ...
};
```

---

## 🐛 Solución de Problemas

### El login no funciona
1. Abre la consola del navegador (F12)
2. Ve a Application → Local Storage
3. Ejecuta:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

### Productos no aparecen
El sistema carga productos de ejemplo automáticamente. Si no aparecen, limpia localStorage y recarga.

### Error de compilación
```bash
rm -rf node_modules
npm install
npm run dev
```

---

## 📦 Deployment

### Netlify / Vercel
1. Conecta tu repositorio
2. Build command: `npm run build`
3. Publish directory: `dist`

### Manual
```bash
npm run build
# Sube la carpeta dist/ a tu servidor
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo.

---

*Última actualización: ${new Date().toLocaleDateString()}*
