# 🔌 Guía de Integración con Backend

Esta guía te ayudará a conectar el frontend de Sport Lentes con un backend (API REST).

---

## 📋 Prerequisitos

### Backend debe tener estos endpoints:

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/verify

GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
PATCH  /api/users/:id/toggle-status

GET    /api/products
GET    /api/products/:id
GET    /api/products/code/:code
POST   /api/products
PUT    /api/products/:id
PATCH  /api/products/:id/stock
DELETE /api/products/:id
POST   /api/products/:id/image

GET    /api/sales
GET    /api/sales/:id
POST   /api/sales
GET    /api/sales/date-range
GET    /api/sales/stats
DELETE /api/sales/all

GET    /api/logs
POST   /api/logs
DELETE /api/logs/all

GET    /api/health (opcional, para verificar conexión)
```

---

## 🚀 Paso 1: Instalar Dependencias

```bash
npm install axios
```

---

## ⚙️ Paso 2: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
```

Para producción:
```env
VITE_API_URL=https://tu-backend.com/api
```

---

## 🔧 Paso 3: Actualizar Context (Ejemplo con AuthContext)

### Opción A: Modo Híbrido (Recomendado para migración)

```typescript
// src/context/AuthContext.tsx
import { authAPI } from '../services/api';

const USE_API = import.meta.env.VITE_USE_API === 'true'; // Controlado por .env

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... estados existentes

  const login = async (username: string, password: string): Promise<boolean> => {
    if (USE_API) {
      // Usar API
      try {
        const response = await authAPI.login(username, password);
        const { user, token } = response;
        
        setUser(user);
        localStorage.setItem('sport_lentes_user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    } else {
      // Usar localStorage (código actual)
      const foundUser = usersList.find(/* ... */);
      // ... lógica actual
    }
  };

  // Similar para otras funciones...
};
```

### Opción B: Solo API (Migración completa)

```typescript
// src/context/AuthContext.tsx
import { authAPI, usersAPI } from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Verificar si hay token guardado
        const token = localStorage.getItem('auth_token');
        if (token) {
          const userData = await authAPI.verifyToken();
          setUser(userData);
        }
        
        // Cargar lista de usuarios si es admin
        if (user?.role === 'admin') {
          const users = await usersAPI.getAll();
          setUsersList(users);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(username, password);
      const { user, token } = response;
      
      setUser(user);
      localStorage.setItem('sport_lentes_user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('sport_lentes_user');
      localStorage.removeItem('auth_token');
    }
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    try {
      const createdUser = await usersAPI.create(newUser);
      setUsersList([...usersList, createdUser]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  // ... resto de funciones similar
};
```

---

## 🔄 Paso 4: Actualizar DataContext

```typescript
// src/context/DataContext.tsx
import { productsAPI, salesAPI, logsAPI } from '../services/api';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, salesData, logsData] = await Promise.all([
          productsAPI.getAll(),
          salesAPI.getAll(),
          logsAPI.getAll(),
        ]);
        
        setProducts(productsData);
        setSales(salesData);
        setLogs(logsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>, userName: string) => {
    try {
      const newProduct = await productsAPI.create(product);
      setProducts([...products, newProduct]);
      
      await logsAPI.create({
        user: userName,
        action: 'Producto Agregado',
        details: `${product.name}`
      });
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateStock = async (productId: string, quantity: number, userName: string) => {
    try {
      const updatedProduct = await productsAPI.updateStock(productId, quantity);
      setProducts(products.map(p => p.id === productId ? updatedProduct : p));
      
      await logsAPI.create({
        user: userName,
        action: 'Stock Actualizado',
        details: `Producto ID: ${productId}, Cantidad: ${quantity}`
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  const addSale = async (sale: Omit<Sale, 'id'>, userName: string) => {
    try {
      const newSale = await salesAPI.create(sale);
      setSales([...sales, newSale]);
      
      await logsAPI.create({
        user: userName,
        action: 'Venta Realizada',
        details: `Total: S/ ${sale.total}`
      });
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  };

  const clearSalesData = async () => {
    try {
      await Promise.all([
        salesAPI.deleteAll(),
        logsAPI.deleteAll()
      ]);
      setSales([]);
      setLogs([]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  };

  // ... resto del código
};
```

---

## 🎯 Paso 5: Manejo de Errores en Componentes

```typescript
// Ejemplo en Sales.tsx
const handleFinalizeSale = async () => {
  if (cart.length === 0) return;

  try {
    await addSale(saleData, user?.name || 'Vendedor');
    setLastSale({ ...saleData, id: Math.random().toString(36).substr(2, 9) });
    setCart([]);
    setShowReceipt(true);
  } catch (error) {
    alert('Error al procesar la venta. Por favor, intenta nuevamente.');
    console.error('Sale error:', error);
  }
};
```

---

## 🔐 Paso 6: Seguridad

### Headers de Autenticación
El servicio API ya está configurado para enviar el token automáticamente:

```typescript
// En api.ts (ya implementado)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Manejo de Tokens Expirados
También maneja automáticamente tokens expirados:

```typescript
// En api.ts (ya implementado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📤 Paso 7: Subir Imágenes de Productos

```typescript
// En Inventory.tsx
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const response = await productsAPI.uploadImage(productId, file);
    // Actualizar producto con nueva URL de imagen
    setProducts(products.map(p => 
      p.id === productId ? { ...p, image: response.imageUrl } : p
    ));
  } catch (error) {
    alert('Error al subir la imagen');
    console.error(error);
  }
};
```

---

## 🧪 Paso 8: Testing de la Conexión

```typescript
// Crear un componente de prueba temporal
import { checkInternetConnection } from '../services/api';

const TestConnection = () => {
  const [status, setStatus] = useState('Verificando...');

  useEffect(() => {
    checkInternetConnection().then(isOnline => {
      setStatus(isOnline ? 'Conectado ✅' : 'Sin conexión ❌');
    });
  }, []);

  return <div>Estado: {status}</div>;
};
```

---

## 🌐 Configuración por Ambiente

### `.env.development`
```env
VITE_API_URL=http://localhost:3000/api
VITE_USE_API=true
```

### `.env.production`
```env
VITE_API_URL=https://api.sportlentes.com/api
VITE_USE_API=true
```

---

## ⚡ Optimizaciones

### 1. Cache de Datos
```typescript
// Usar React Query para cache automático
import { useQuery, useMutation } from '@tanstack/react-query';

const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

### 2. Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await productsAPI.getAll();
    setProducts(data);
  } catch (err) {
    setError('Error al cargar productos');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🔄 Migración Gradual (Recomendado)

### Fase 1: Preparación
- ✅ Instalar axios
- ✅ Crear archivos `.env`
- ✅ Implementar servicio API

### Fase 2: Testing
- Probar conexión con backend
- Verificar autenticación
- Probar CRUD de productos

### Fase 3: Migración por Módulos
1. Primero: Autenticación
2. Segundo: Productos
3. Tercero: Ventas
4. Cuarto: Usuarios y Logs

### Fase 4: Limpieza
- Remover código de localStorage
- Optimizar con React Query
- Implementar manejo de errores robusto

---

## ❓ FAQ

### ¿El frontend funciona sin backend?
Sí, actualmente usa localStorage. Puedes activar/desactivar el backend con `VITE_USE_API`.

### ¿Cómo manejo la sincronización offline?
Puedes usar bibliotecas como `Workbox` para service workers y cache.

### ¿Qué pasa si el backend está caído?
El interceptor de axios detecta esto y puedes mostrar un mensaje al usuario.

---

## 📞 Ejemplo Completo de Backend (Node.js + Express)

Ver archivo `BACKEND_EXAMPLE.md` para un ejemplo de implementación del backend.

---

*¿Necesitas ayuda? Contacta al equipo de desarrollo.*
