import axios from 'axios';
import type { Product, Sale } from '../context/DataContext';
import type { User } from '../context/AuthContext';

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios con configuración
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH API ====================

export const authAPI = {
    /**
     * Login de usuario
     */
    login: async (username: string, password: string) => {
        const response = await api.post('/auth/login', { username, password });
        return response.data; // { user, token }
    },

    /**
     * Logout
     */
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    /**
     * Verificar token
     */
    verifyToken: async () => {
        const response = await api.get('/auth/verify');
        return response.data;
    },
};

// ==================== USERS API ====================

export const usersAPI = {
    /**
     * Obtener todos los usuarios
     */
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    /**
     * Crear usuario
     */
    create: async (userData: Omit<User, 'id'>) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    /**
     * Actualizar usuario
     */
    update: async (id: string, userData: Partial<User>) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    /**
     * Eliminar usuario
     */
    delete: async (id: string) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    /**
     * Cambiar estado de usuario
     */
    toggleStatus: async (id: string) => {
        const response = await api.patch(`/users/${id}/toggle-status`);
        return response.data;
    },
};

// ==================== PRODUCTS API ====================

export const productsAPI = {
    /**
     * Obtener todos los productos
     */
    getAll: async () => {
        const response = await api.get('/products');
        return response.data;
    },

    /**
     * Obtener producto por ID
     */
    getById: async (id: string) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    /**
     * Obtener producto por código de barras
     */
    getByCode: async (code: string) => {
        const response = await api.get(`/products/code/${code}`);
        return response.data;
    },

    /**
     * Crear producto
     */
    create: async (productData: Omit<Product, 'id'>) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    /**
     * Actualizar producto
     */
    update: async (id: string, productData: Partial<Product>) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    /**
     * Actualizar stock
     */
    updateStock: async (id: string, quantity: number) => {
        const response = await api.patch(`/products/${id}/stock`, { quantity });
        return response.data;
    },

    /**
     * Eliminar producto
     */
    delete: async (id: string) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    /**
     * Subir imagen de producto
     */
    uploadImage: async (id: string, imageFile: File) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        const response = await api.post(`/products/${id}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

// ==================== SALES API ====================

export const salesAPI = {
    /**
     * Obtener todas las ventas
     */
    getAll: async () => {
        const response = await api.get('/sales');
        return response.data;
    },

    /**
     * Obtener venta por ID
     */
    getById: async (id: string) => {
        const response = await api.get(`/sales/${id}`);
        return response.data;
    },

    /**
     * Crear venta
     */
    create: async (saleData: Omit<Sale, 'id'>) => {
        const response = await api.post('/sales', saleData);
        return response.data;
    },

    /**
     * Obtener ventas por rango de fechas
     */
    getByDateRange: async (startDate: string, endDate: string) => {
        const response = await api.get('/sales/date-range', {
            params: { startDate, endDate },
        });
        return response.data;
    },

    /**
     * Obtener estadísticas de ventas
     */
    getStats: async () => {
        const response = await api.get('/sales/stats');
        return response.data;
    },

    /**
     * Eliminar todas las ventas (solo admin)
     */
    deleteAll: async () => {
        const response = await api.delete('/sales/all');
        return response.data;
    },
};

// ==================== LOGS API ====================

export const logsAPI = {
    /**
     * Obtener todos los logs
     */
    getAll: async () => {
        const response = await api.get('/logs');
        return response.data;
    },

    /**
     * Crear log
     */
    create: async (logData: { user: string; action: string; details: string }) => {
        const response = await api.post('/logs', logData);
        return response.data;
    },

    /**
     * Eliminar todos los logs (solo admin)
     */
    deleteAll: async () => {
        const response = await api.delete('/logs/all');
        return response.data;
    },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Verifica si hay conexión a internet
 */
export const checkInternetConnection = async (): Promise<boolean> => {
    try {
        await api.get('/health');
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Maneja errores de API de forma consistente
 */
export const handleAPIError = (error: any): string => {
    if (error.response) {
        // El servidor respondió con un código de error
        return error.response.data?.message || 'Error en el servidor';
    } else if (error.request) {
        // La petición fue hecha pero no hubo respuesta
        return 'No hay conexión con el servidor';
    } else {
        // Algo pasó al configurar la petición
        return error.message || 'Error desconocido';
    }
};

export default api;
