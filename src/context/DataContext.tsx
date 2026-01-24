import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Product {
    id: string;
    code: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
}

export interface Sale {
    id: string;
    date: string;
    items: { productId: string; name: string; quantity: number; price: number }[];
    total: number;
    sellerId: string;
    sellerName: string;
    client?: {
        name?: string;
        ruc?: string;
        address?: string;
    };
    saleType?: string;
    discount?: number;
}

export interface ActivityLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
}

export interface Config {
    ruc: string;
    address: string;
    phone: string;
    name: string;
    galleryImages?: string[];
}

interface DataContextType {
    products: Product[];
    sales: Sale[];
    logs: ActivityLog[];
    config: Config;
    isDataLoading: boolean;
    syncError: string | null;
    connectionStatus: 'online' | 'syncing' | 'offline';
    addProduct: (product: Omit<Product, 'id'>, userName: string) => Promise<void>;
    updateStock: (productId: string, quantity: number, userName: string) => Promise<void>;
    addSale: (sale: Omit<Sale, 'id'>, userName: string) => Promise<string>;
    addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => Promise<void>;
    clearSalesData: () => Promise<void>;
    deleteProduct: (productId: string, userName: string) => Promise<void>;
    updateProduct: (productId: string, updates: Partial<Product>, userName: string) => Promise<void>;
    updateConfig: (newConfig: Config) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default images fallback
const DEFAULT_GALLERY = [
    '1574258269985-8c50ac1b5e3b',
    '1509695507497-de37dc6c8c80',
    '1577803645773-f933d55cd051',
    '1483412033650-1015ddeb83d1',
    '1511499767150-a48a237f0083',
    '1473496169904-658ba7c44d8a',
    '1584036533827-e7e4e5d2b8a0',
    '1614715838832-61dfdffb97b5',
    '1559056199-641a0ac8b55e',
    '1501196354995-cbb51c65aaea',
    '1572635196237-14b3f281503f',
    '1591076482161-421a3aaee5f7',
    '1508296695146-25e7b52a154f',
    '1516706059273-0498da1704ea',
    '1614715838301-c8b57122a0e4',
    '1582142306909-195724d6f15b'
];

// Helper to validate UUID
const isValidUUID = (uuid: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem('sport_lentes_products');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed.filter((p: any) => isValidUUID(p.id)) : [];
            } catch (e) {
                console.error("Error parsing saved products:", e);
                return [];
            }
        }
        return [];
    });
    const [sales, setSales] = useState<Sale[]>(() => {
        const saved = localStorage.getItem('sport_lentes_sales');
        return saved ? JSON.parse(saved) : [];
    });
    const [logs, setLogs] = useState<ActivityLog[]>(() => {
        const saved = localStorage.getItem('sport_lentes_logs');
        return saved ? JSON.parse(saved) : [];
    });
    const [config, setConfig] = useState<Config>(() => {
        const saved = localStorage.getItem('sport_lentes_config');
        return saved ? JSON.parse(saved) : {
            ruc: '20601234567',
            address: 'Av. Principal 123, Ciudad',
            phone: '+51 951 955 969',
            name: 'Sport Lentes',
            galleryImages: DEFAULT_GALLERY
        };
    });
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'online' | 'syncing' | 'offline'>('syncing');

    // Subscriptions
    useEffect(() => {
        let productsChannel: RealtimeChannel | null = null;
        let salesChannel: RealtimeChannel | null = null;
        let logsChannel: RealtimeChannel | null = null;
        let configChannel: RealtimeChannel | null = null;

        const initializeData = async () => {
            try {
                setIsDataLoading(true);
                setConnectionStatus('syncing');

                // Cargar productos
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('*')
                    .order('name');

                if (productsError) throw productsError;

                if (productsData) {
                    setProducts(productsData);
                    localStorage.setItem('sport_lentes_products', JSON.stringify(productsData));
                }

                // Cargar ventas
                const { data: salesData, error: salesError } = await supabase
                    .from('sales')
                    .select('*')
                    .order('date', { ascending: false });

                if (salesError) throw salesError;

                if (salesData) {
                    const mappedSales = salesData.map((s: any) => ({
                        id: s.id,
                        date: s.date,
                        items: s.items,
                        total: Number(s.total),
                        sellerId: s.seller_id,
                        sellerName: s.seller_name,
                        client: s.client,
                        saleType: s.sale_type,
                        discount: Number(s.discount || 0)
                    }));
                    setSales(mappedSales);
                    localStorage.setItem('sport_lentes_sales', JSON.stringify(mappedSales));
                }

                // Cargar logs
                const { data: logsData, error: logsError } = await supabase
                    .from('logs')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(50);

                if (logsError) throw logsError;

                if (logsData) {
                    setLogs(logsData);
                    localStorage.setItem('sport_lentes_logs', JSON.stringify(logsData));
                }

                // Cargar configuración
                const { data: configData, error: configError } = await supabase
                    .from('settings')
                    .select('*')
                    .eq('id', 'app_config')
                    .single();

                if (!configError && configData) {
                    const newConfig = {
                        ruc: configData.ruc,
                        address: configData.address,
                        phone: configData.phone,
                        name: configData.name,
                        galleryImages: configData.gallery_images || DEFAULT_GALLERY
                    };
                    setConfig(newConfig);
                    localStorage.setItem('sport_lentes_config', JSON.stringify(newConfig));
                }

                setConnectionStatus('online');
                setSyncError(null);
            } catch (error: any) {
                console.error('Error loading data:', error);
                setSyncError(error.message);
                setConnectionStatus('offline');
            } finally {
                setIsDataLoading(false);
            }
        };

        initializeData();

        // Suscribirse a cambios en tiempo real - Productos
        productsChannel = supabase
            .channel('products-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                console.log('Products change:', payload);

                if (payload.eventType === 'INSERT') {
                    setProducts(prev => [...prev, payload.new as Product]);
                } else if (payload.eventType === 'UPDATE') {
                    setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
                } else if (payload.eventType === 'DELETE') {
                    setProducts(prev => prev.filter(p => p.id !== payload.old.id));
                }
            })
            .subscribe();

        // Suscribirse a cambios en tiempo real - Ventas
        salesChannel = supabase
            .channel('sales-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, (payload) => {
                console.log('Sales change:', payload);

                if (payload.eventType === 'INSERT') {
                    const newSale = payload.new as any;
                    const mappedSale: Sale = {
                        id: newSale.id,
                        date: newSale.date,
                        items: newSale.items,
                        total: Number(newSale.total),
                        sellerId: newSale.seller_id,
                        sellerName: newSale.seller_name,
                        client: newSale.client,
                        saleType: newSale.sale_type,
                        discount: Number(newSale.discount || 0)
                    };
                    setSales(prev => [mappedSale, ...prev]);
                } else if (payload.eventType === 'DELETE') {
                    setSales(prev => prev.filter(s => s.id !== payload.old.id));
                }
            })
            .subscribe();

        // Suscribirse a cambios en tiempo real - Logs
        logsChannel = supabase
            .channel('logs-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setLogs(prev => [payload.new as ActivityLog, ...prev.slice(0, 49)]);
                } else if (payload.eventType === 'DELETE') {
                    setLogs(prev => prev.filter(l => l.id !== payload.old.id));
                }
            })
            .subscribe();

        // Suscribirse a cambios en tiempo real - Configuración
        configChannel = supabase
            .channel('settings-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
                if (payload.new && typeof payload.new === 'object') {
                    const data = payload.new as any;
                    const newConfig: Config = {
                        ruc: data.ruc || config.ruc,
                        address: data.address || config.address,
                        phone: data.phone || config.phone,
                        name: data.name || config.name,
                        galleryImages: data.gallery_images || DEFAULT_GALLERY
                    };
                    setConfig(newConfig);
                    localStorage.setItem('sport_lentes_config', JSON.stringify(newConfig));
                }
            })
            .subscribe();

        // Cleanup
        return () => {
            if (productsChannel) supabase.removeChannel(productsChannel);
            if (salesChannel) supabase.removeChannel(salesChannel);
            if (logsChannel) supabase.removeChannel(logsChannel);
            if (configChannel) supabase.removeChannel(configChannel);
        };
    }, []);

    // Actualizar localStorage cuando cambien los datos
    useEffect(() => {
        localStorage.setItem('sport_lentes_products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('sport_lentes_sales', JSON.stringify(sales));
    }, [sales]);

    useEffect(() => {
        localStorage.setItem('sport_lentes_logs', JSON.stringify(logs));
    }, [logs]);

    const addLog = async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
        try {
            const { error } = await supabase
                .from('logs')
                .insert([{
                    ...log,
                    timestamp: new Date().toISOString()
                }]);

            if (error) throw error;
        } catch (e) {
            console.error('Error adding log:', e);
        }
    };

    const addProduct = async (product: Omit<Product, 'id'>, userName: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .insert([product]);

            if (error) throw error;

            await addLog({
                user: userName,
                action: 'Producto Agregado',
                details: `${product.name} (${product.code})`
            });
        } catch (e) {
            console.error('Error adding product:', e);
            throw e;
        }
    };

    const updateStock = async (productId: string, quantity: number, userName: string) => {
        try {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const newStock = product.stock + quantity;

            const { error } = await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', productId);

            if (error) throw error;

            await addLog({
                user: userName,
                action: 'Stock Actualizado',
                details: `${product.name}: ${quantity > 0 ? '+' : ''}${quantity}`
            });
        } catch (e) {
            console.error('Error updating stock:', e);
            throw e;
        }
    };

    const addSale = async (sale: Omit<Sale, 'id'>, userName: string): Promise<string> => {
        try {
            // Crear la venta
            const completedSale = {
                ...sale,
                date: new Date().toISOString()
            };

            // Mapear a snake_case para Supabase
            const saleToInsert = {
                date: completedSale.date,
                items: completedSale.items,
                total: completedSale.total,
                seller_id: completedSale.sellerId,
                seller_name: completedSale.sellerName,
                client: completedSale.client,
                sale_type: completedSale.saleType,
                discount: completedSale.discount
            };

            const { data, error } = await supabase
                .from('sales')
                .insert([saleToInsert])
                .select()
                .single();

            if (error) throw error;

            // Actualizar stock de productos
            for (const item of sale.items) {
                // Skip if product ID is not a valid UUID (prevents "invalid input syntax for type uuid")
                if (!isValidUUID(item.productId)) {
                    console.warn(`Skipping stock update for invalid product ID: ${item.productId}`);
                    continue;
                }

                const product = products.find(p => p.id === item.productId);
                if (product) {
                    await supabase
                        .from('products')
                        .update({ stock: product.stock - item.quantity })
                        .eq('id', item.productId);
                }
            }

            // Agregar log
            addLog({
                user: userName,
                action: 'Venta Realizada',
                details: `Venta ID: ${data.id} - Total: S/ ${sale.total} - ${sale.items.length} items`
            }).catch(e => console.error('Error adding sale log:', e));

            return data.id;
        } catch (e) {
            console.error('Error processing sale:', e);
            throw e;
        }
    };

    const clearSalesData = async () => {
        try {
            // Eliminar todas las ventas
            const { error: salesError } = await supabase
                .from('sales')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todo

            if (salesError) throw salesError;

            // Eliminar todos los logs
            const { error: logsError } = await supabase
                .from('logs')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todo

            if (logsError) throw logsError;
        } catch (e) {
            console.error('Error clearing data:', e);
            throw e;
        }
    };

    const deleteProduct = async (productId: string, userName: string) => {
        try {
            const product = products.find(p => p.id === productId);

            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            if (product) {
                await addLog({
                    user: userName,
                    action: 'Producto Eliminado',
                    details: `${product.name} (${product.code})`
                });
            }
        } catch (e) {
            console.error('Error deleting product:', e);
            throw e;
        }
    };

    const updateProduct = async (productId: string, updates: Partial<Product>, userName: string) => {
        try {
            const product = products.find(p => p.id === productId);

            const { error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', productId);

            if (error) throw error;

            if (product) {
                await addLog({
                    user: userName,
                    action: 'Producto Actualizado',
                    details: `${product.name} - Cambios: ${Object.keys(updates).join(', ')}`
                });
            }
        } catch (e) {
            console.error('Error updating product:', e);
            throw e;
        }
    };

    const updateConfig = async (newConfig: Config) => {
        try {
            const { error } = await supabase
                .from('settings')
                .upsert([{ id: 'app_config', ...newConfig }]);

            if (error) throw error;
        } catch (e) {
            console.error('Error updating config:', e);
            throw e;
        }
    };

    const getStatusStyles = () => {
        switch (connectionStatus) {
            case 'online': return { bg: 'rgba(0, 255, 0, 0.1)', color: '#44ff44', text: '● SUPABASE EN LÍNEA', border: 'rgba(0, 255, 0, 0.2)' };
            case 'syncing': return { bg: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary)', text: '○ SINCRONIZANDO...', border: 'rgba(0, 229, 255, 0.2)' };
            case 'offline': return { bg: 'rgba(255, 0, 0, 0.1)', color: '#ff4444', text: '✖ ERROR DE RED', border: 'rgba(255, 0, 0, 0.2)' };
        }
    };

    const styles = getStatusStyles();

    return (
        <DataContext.Provider value={{
            products,
            sales,
            logs,
            config,
            isDataLoading,
            syncError,
            connectionStatus,
            addProduct,
            updateStock,
            addSale,
            addLog,
            clearSalesData,
            deleteProduct,
            updateProduct,
            updateConfig
        }}>
            <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 9999, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                {syncError && (
                    <div style={{
                        padding: '8px 15px',
                        background: 'rgba(255,0,0,0.85)',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        border: '1px solid #ff4444',
                        marginBottom: '5px',
                        maxWidth: '250px',
                        pointerEvents: 'auto'
                    }}>
                        ⚠️ ERROR: {syncError}
                    </div>
                )}
                <div style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.6rem',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(2px)'
                }}>
                    SUPABASE: {products.length} PRODUCTOS SYNC
                </div>
                <div style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    background: styles.bg,
                    color: styles.color,
                    border: `1px solid ${styles.border}`,
                    backdropFilter: 'blur(5px)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}>
                    {styles.text}
                </div>
            </div>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
