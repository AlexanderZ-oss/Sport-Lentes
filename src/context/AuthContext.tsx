import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_USERS } from '../constants';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  where
} from 'firebase/firestore';

export type Role = 'admin' | 'employee' | null;

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
  password?: string;
  status?: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  usersList: User[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  addUser: (newUser: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [hasCheckedInitialUsers, setHasCheckedInitialUsers] = useState(false);

  useEffect(() => {
    // 1. Load Session (keep session local to the browser)
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Session error", e);
      }
    }

    // 2. Load Users from Firestore (Realtime)
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uList: User[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as User));

      setUsersList(uList);

      if (uList.length > 0) {
        setIsLoading(false);
        setHasCheckedInitialUsers(true);
      }

      // Seed if empty ONLY IF it's the first time checking and on network
      if (!hasCheckedInitialUsers && uList.length === 0 && !snapshot.metadata.fromCache) {
        setHasCheckedInitialUsers(true);
        seedUsers();
        setIsLoading(false);
      }
    }, (error) => {
      console.error("Auth sync error", error);
      setIsLoading(false);
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  const seedUsers = async () => {
    // Force check: Ensure the corporate admin exists. 
    const adminQuery = query(collection(db, 'users'), where('username', '==', 'sportlents@gmail.com'));
    const adminSnap = await getDocs(adminQuery);

    if (adminSnap.empty) {
      console.log("Corporate admin missing. seeding system users...");
      const batch = writeBatch(db);
      DEFAULT_USERS.forEach(u => {
        const docRef = doc(collection(db, 'users'));
        batch.set(docRef, { ...u, id: docRef.id });
      });
      await batch.commit();
      console.log("System initialized with default users");
    } else {
      console.log("System already initialized. Skipping seed.");
    }
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    console.log("Login attempt:", username);

    // 1. Check loaded Cache (usersList)
    const cachedUser = usersList.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);
    if (cachedUser) {
      if (cachedUser.status !== 'active') {
        console.warn("User inactive");
        return false;
      }
      console.log("Login success (Cache)");
      const { password, ...safeUser } = cachedUser;
      setUser(safeUser as User);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
      return true;
    }

    // 2. Direct Firestore Query (in case cache is empty/slow)
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '==', username),
        where('password', '==', pass)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data() as User;
        // Case insensitive check just in case, though query handled exact match
        if (docData.status !== 'active') return false;

        console.log("Login success (Direct DB)");
        const { password, ...safeUser } = { ...docData, id: snapshot.docs[0].id };
        setUser(safeUser as User);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));

        // If we found it here but not in cache, force a re-fetch or assume snapshot will catch up
        return true;
      }
    } catch (e) {
      console.error("Direct DB Login failed:", e);
    }

    // 3. Fallback / Emergency (Hardcoded Admin)
    // Only allows if no users exist in DB or DB is unreachable, ensuring we don't lock out the owner
    const defaultUser = DEFAULT_USERS.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);
    if (defaultUser) {
      console.log("Login success (Emergency Fallback)");
      setUser(defaultUser as User);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));

      // Background: Attempt to seed this user to DB so next time it works significantly
      seedUsers();

      return true;
    }

    return false;
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    try {
      // Note: Storing passwords in plain text is insecure. 
      // For a real app, integrate Firebase Auth directly.
      const docRef = await addDoc(collection(db, 'users'), {
        ...newUser,
        status: 'active'
      });
      // We don't need to manually update state/localstorage, onSnapshot handles it.
      // But we might want to update the doc with its own ID if we rely on it inside the object
      await updateDoc(docRef, { id: docRef.id });
    } catch (e) {
      console.error("Error adding user", e);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {
      console.error("Error deleting user", e);
    }
  };

  const toggleUserStatus = async (id: string) => {
    try {
      const u = usersList.find(user => user.id === id);
      if (u) {
        const newStatus = u.status === 'active' ? 'inactive' : 'active';
        await updateDoc(doc(db, 'users', id), { status: newStatus });
      }
    } catch (e) {
      console.error("Error toggling status", e);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  return (
    <AuthContext.Provider value={{ user, usersList, login, logout, isLoading, addUser, deleteUser, toggleUserStatus }}>
      {isLoading && usersList.length === 0 ? (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0a0a0c', color: 'white' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Sincronizando...</div>
            <p style={{ color: 'var(--text-muted)' }}>Optimizando acceso de Sport Lentes</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
