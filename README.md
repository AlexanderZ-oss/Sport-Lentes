# 📚 Guía de Desarrollo - Sport Lentes

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```
Abre [http://localhost:5173](http://localhost:5173)

### Construcción para Producción
```bash
npm run build
```

### Preview de Producción
```bash
npm run preview
```

---

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

- **React 18** - Framework principal
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Context API** - State management
- **React Router** - Navegación
- **Recharts** - Gráficos
- **jsPDF** - Generación de PDFs
- **html5-qrcode** - Escaneo de códigos

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
