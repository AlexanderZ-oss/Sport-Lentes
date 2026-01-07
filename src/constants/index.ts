// Storage Keys
export const STORAGE_KEYS = {
    USER: 'sport_lentes_user',
    USERS_DB: 'sport_lentes_users_db',
    PRODUCTS: 'sport_lentes_products',
    SALES: 'sport_lentes_sales',
    LOGS: 'sport_lentes_logs'
} as const;

// User Roles
export const ROLES = {
    ADMIN: 'admin',
    EMPLOYEE: 'employee'
} as const;

// Security Configuration
export const SECURITY = {
    VERIFICATION_CODE: 'SL-2026', // Code required to register or modify sensitive data
    SUPER_ADMIN_EMAIL: 'sportlents@gmail.com'
} as const;

// Default Credentials
export const DEFAULT_USERS = [
    {
        id: '1',
        username: 'sportlents@gmail.com',
        password: '123',
        role: 'admin' as const,
        name: 'Super Admin Sport Lentes',
        status: 'active' as const
    },
    {
        id: '2',
        username: 'admin',
        password: '123',
        role: 'admin' as const,
        name: 'Administrador Sport',
        status: 'active' as const
    },
    {
        id: '3',
        username: 'empleado',
        password: '123',
        role: 'employee' as const,
        name: 'Empleado Ventas',
        status: 'active' as const
    }
];

// App Configuration
export const APP_CONFIG = {
    NAME: 'Sport Lentes',
    RUC: '20601234567',
    ADDRESS: 'Av. Principal 123, Ciudad',
    PHONE: '+51 951 955 969',
    IGV_RATE: 0.18,
    WHOLESALE_QTY: 12,
    WHOLESALE_DISCOUNT: 0.20
} as const;

// PDF Configuration
export const PDF_CONFIG = {
    FONT_SIZE: {
        TITLE: 18,
        SUBTITLE: 14,
        NORMAL: 11,
        SMALL: 8
    },
    COLORS: {
        PRIMARY: [255, 107, 0] as [number, number, number],
        ALT_ROW: [245, 245, 245] as [number, number, number],
        TEXT: [255, 255, 255] as [number, number, number]
    }
} as const;
