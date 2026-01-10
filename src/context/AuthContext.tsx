import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_USERS } from '../constants';
import { supabase } from '../supabase/config';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  isAuthOnline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isAuthOnline, setIsAuthOnline] = useState(false);
  const [hasCheckedInitialUsers, setHasCheckedInitialUsers] = useState(false);

  useEffect(() => {
    // 1. Load Session from LocalStorage
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Session error", e);
      }
    }

    let usersChannel: RealtimeChannel | null = null;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // 2. Load Users from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (error) throw error;

        if (data) {
          setUsersList(data as User[]);
          setIsAuthOnline(true);

          // Seed if empty
          if (!hasCheckedInitialUsers && data.length === 0) {
            setHasCheckedInitialUsers(true);
            await seedUsers();
          } else {
            setHasCheckedInitialUsers(true);
          }
        }
      } catch (error) {
        console.error("Auth initialization error", error);
        setIsAuthOnline(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // 3. Realtime Subscription for Users
    usersChannel = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setUsersList(prev => [...prev, payload.new as User]);
        } else if (payload.eventType === 'UPDATE') {
          setUsersList(prev => prev.map(u => u.id === payload.new.id ? payload.new as User : u));
        } else if (payload.eventType === 'DELETE') {
          setUsersList(prev => prev.filter(u => u.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      if (usersChannel) supabase.removeChannel(usersChannel);
    };
  }, []);

  const seedUsers = async () => {
    try {
      // Check if super admin exists
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', 'sportlents@gmail.com')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        console.log("Seeding default users to Supabase...");
        const { error: insertError } = await supabase
          .from('users')
          .insert(DEFAULT_USERS);

        if (insertError) throw insertError;
        console.log("Default users seeded successfully");
      }
    } catch (e) {
      console.error("Error seeding users:", e);
    }
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    console.log("Login attempt:", username);

    // 1. Check local usersList first for speed
    const cachedUser = usersList.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);
    if (cachedUser) {
      if (cachedUser.status !== 'active') {
        alert("Usuario inactivo");
        return false;
      }
      const { password, ...safeUser } = cachedUser;
      setUser(safeUser as User);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
      return true;
    }

    // 2. Direct Supabase Query
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', pass)
        .single();

      if (error) throw error;

      if (data) {
        if (data.status !== 'active') {
          alert("Usuario inactivo");
          return false;
        }
        const { password, ...safeUser } = data;
        setUser(safeUser as User);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
        return true;
      }
    } catch (e) {
      console.error("Supabase Login failed:", e);
    }

    // 3. Last Fallback (Hardcoded defaults)
    const fallbackUser = DEFAULT_USERS.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);
    if (fallbackUser) {
      const { password, ...safeUser } = fallbackUser;
      setUser(safeUser as User);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
      seedUsers(); // Background seed
      return true;
    }

    return false;
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert([newUser]);
      if (error) throw error;
    } catch (e) {
      console.error("Error adding user", e);
      throw e;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error("Error deleting user", e);
      throw e;
    }
  };

  const toggleUserStatus = async (id: string) => {
    try {
      const u = usersList.find(user => user.id === id);
      if (u) {
        const newStatus = u.status === 'active' ? 'inactive' : 'active';
        const { error } = await supabase
          .from('users')
          .update({ status: newStatus })
          .eq('id', id);
        if (error) throw error;
      }
    } catch (e) {
      console.error("Error toggling status", e);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error("Error updating user", e);
      throw e;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  return (
    <AuthContext.Provider value={{ user, usersList, login, logout, isLoading, addUser, deleteUser, toggleUserStatus, updateUser, isAuthOnline }}>
      <div style={{ position: 'fixed', bottom: '35px', right: '10px', zIndex: 9999, pointerEvents: 'none' }}>
        <div style={{
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          background: isAuthOnline ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)',
          color: isAuthOnline ? 'var(--primary)' : '#ff4444',
          border: `1px solid ${isAuthOnline ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 0, 0, 0.2)'}`,
          backdropFilter: 'blur(5px)'
        }}>
          {isAuthOnline ? '● AUTH SUPABASE OK' : '○ ERROR AUTH SUPABASE'}
        </div>
      </div>
      {children}
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
