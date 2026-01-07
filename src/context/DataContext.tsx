import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    writeBatch,
    limit,
    getDocs,
    setDoc,
    increment,
    runTransaction
} from 'firebase/firestore';

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
}

interface DataContextType {
    products: Product[];
    sales: Sale[];
    logs: ActivityLog[];
    config: Config;
    addProduct: (product: Omit<Product, 'id'>, userName: string) => Promise<void>;
    updateStock: (productId: string, quantity: number, userName: string) => Promise<void>;
    addSale: (sale: Omit<Sale, 'id'>, userName: string) => Promise<void>;
    addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => Promise<void>;
    clearSalesData: () => Promise<void>;
    deleteProduct: (productId: string, userName: string) => Promise<void>;
    updateConfig: (newConfig: Config) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'online' | 'syncing' | 'offline'>('syncing');
    const [config, setConfig] = useState<Config>({
        ruc: '20601234567',
        address: 'Av. Principal 123, Ciudad',
        phone: '+51 951 955 969',
        name: 'Sport Lentes'
    });

    useEffect(() => {
        // Monitor Online Status via Products
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
            const prods: Product[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Product));
            setProducts(prods);

            if (snapshot.metadata.fromCache) {
                setConnectionStatus('syncing');
            } else {
                setConnectionStatus('online');
            }
        }, (error) => {
            console.error("Firestore error (Products):", error);
            setConnectionStatus('offline');
        });

        const salesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'));
        const unsubSales = onSnapshot(salesQuery, (snapshot) => {
            const salesData: Sale[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Sale));
            setSales(salesData);
        });

        const logsQuery = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(50));
        const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
            const logsData: ActivityLog[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ActivityLog));
            setLogs(logsData);
        });

        const unsubConfig = onSnapshot(doc(db, 'settings', 'app_config'), (snapshot) => {
            if (snapshot.exists()) {
                setConfig(snapshot.data() as Config);
            }
        });

        return () => {
            unsubProducts();
            unsubSales();
            unsubLogs();
            unsubConfig();
        };
    }, []);

    // Real-time synchronization is handled automatically by the onSnapshot listeners above.
    // No manual refreshing is ever required.

    const addLog = async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
        try {
            await addDoc(collection(db, 'logs'), {
                ...log,
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding log:", e);
        }
    };

    const addProduct = async (product: Omit<Product, 'id'>, userName: string) => {
        try {
            await addDoc(collection(db, 'products'), product);
            await addLog({ user: userName, action: 'Producto Agregado', details: `${product.name} (${product.code})` });
        } catch (e) {
            console.error("Error adding product:", e);
        }
    };

    const updateStock = async (productId: string, quantity: number, userName: string) => {
        try {
            const productRef = doc(db, 'products', productId);
            const product = products.find(p => p.id === productId);
            if (!product) return;

            // Atomic Increment: Critical for multi-user safety
            await updateDoc(productRef, {
                stock: increment(quantity)
            });

            await addLog({
                user: userName,
                action: 'Stock Actualizado',
                details: `${product.name}: ${quantity > 0 ? '+' : ''}${quantity}`
            });
        } catch (e) {
            console.error("Error updating stock:", e);
            throw e;
        }
    };

    const addSale = async (sale: Omit<Sale, 'id'>, userName: string) => {
        try {
            // Use Transaction to ensure stock doesn't go negative and handles concurrency
            await runTransaction(db, async (transaction) => {
                const saleRef = doc(collection(db, 'sales'));

                // Add the sale record
                transaction.set(saleRef, { ...sale, date: new Date().toISOString() });

                // Update products stock atomically
                for (const item of sale.items) {
                    const productRef = doc(db, 'products', item.productId);
                    transaction.update(productRef, {
                        stock: increment(-item.quantity)
                    });
                }
            });

            await addLog({
                user: userName,
                action: 'Venta Realizada',
                details: `Total: S/ ${sale.total} - ${sale.items.length} items`
            });
        } catch (e) {
            console.error("Error processing sale:", e);
            throw e;
        }
    };

    const clearSalesData = async () => {
        try {
            const batch = writeBatch(db);
            sales.forEach(s => { batch.delete(doc(db, 'sales', s.id)); });
            logs.forEach(l => { batch.delete(doc(db, 'logs', l.id)); });
            await batch.commit();
        } catch (e) {
            console.error("Error clearing data:", e);
        }
    };

    const deleteProduct = async (productId: string, userName: string) => {
        try {
            const product = products.find(p => p.id === productId);
            await deleteDoc(doc(db, 'products', productId));
            if (product) {
                await addLog({ user: userName, action: 'Producto Eliminado', details: `${product.name} (${product.code})` });
            }
        } catch (e) {
            console.error("Error deleting product:", e);
        }
    };

    const updateConfig = async (newConfig: Config) => {
        try {
            await setDoc(doc(db, 'settings', 'app_config'), newConfig);
        } catch (e) {
            console.error("Error updating config:", e);
        }
    };

    const getStatusStyles = () => {
        switch (connectionStatus) {
            case 'online': return { bg: 'rgba(0, 255, 0, 0.1)', color: '#44ff44', text: '● NUBE EN LÍNEA', border: 'rgba(0, 255, 0, 0.2)' };
            case 'syncing': return { bg: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary)', text: '○ SINCRONIZANDO...', border: 'rgba(0, 229, 255, 0.2)' };
            case 'offline': return { bg: 'rgba(255, 0, 0, 0.1)', color: '#ff4444', text: '✖ ERROR DE RED', border: 'rgba(255, 0, 0, 0.2)' };
        }
    };

    const styles = getStatusStyles();

    return (
        <DataContext.Provider value={{ products, sales, logs, config, addProduct, updateStock, addSale, addLog, clearSalesData, deleteProduct, updateConfig }}>
            <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 9999, pointerEvents: 'none' }}>
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
