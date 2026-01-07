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
    setDoc
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
    const [config, setConfig] = useState<Config>({
        ruc: '20601234567',
        address: 'Av. Principal 123, Ciudad',
        phone: '+51 951 955 969',
        name: 'Sport Lentes'
    });
    const [hasCheckedInitialProducts, setHasCheckedInitialProducts] = useState(false);

    useEffect(() => {
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
            const prods: Product[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Product));
            setProducts(prods);

            if (prods.length > 0) {
                setHasCheckedInitialProducts(true);
            }

            if (!hasCheckedInitialProducts && prods.length === 0 && !snapshot.metadata.fromCache) {
                setHasCheckedInitialProducts(true);
                seedDatabase();
            }
        }, (error) => {
            console.error("Firestore error:", error);
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

    const seedDatabase = async () => {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) return;
        const batch = writeBatch(db);
        const initialProducts = [
            { code: '1001', name: 'Velocity Racer Neon', price: 299.90, stock: 15, category: 'Running', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600' },
            { code: '1002', name: 'Hydro Blue Polarized', price: 349.00, stock: 8, category: 'Acuáticos', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600' }
        ];
        initialProducts.forEach(p => {
            const docRef = doc(collection(db, 'products'));
            batch.set(docRef, p);
        });
        await batch.commit();
    };

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
            const newStock = Math.max(0, product.stock + quantity);
            await updateDoc(productRef, { stock: newStock });
            await addLog({
                user: userName,
                action: 'Stock Actualizado',
                details: `${product.name}: ${quantity > 0 ? '+' : ''}${quantity}`
            });
        } catch (e) {
            console.error("Error updating stock:", e);
        }
    };

    const addSale = async (sale: Omit<Sale, 'id'>, userName: string) => {
        try {
            const batch = writeBatch(db);
            const saleRef = doc(collection(db, 'sales'));
            batch.set(saleRef, { ...sale, date: new Date().toISOString() });
            for (const item of sale.items) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const productRef = doc(db, 'products', item.productId);
                    const newStock = Math.max(0, product.stock - item.quantity);
                    batch.update(productRef, { stock: newStock });
                }
            }
            await batch.commit();
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

    return (
        <DataContext.Provider value={{ products, sales, logs, config, addProduct, updateStock, addSale, addLog, clearSalesData, deleteProduct, updateConfig }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
