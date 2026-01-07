import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Simple mockup of modules
import Inventory from './Inventory';
import Sales from './Sales';
import Reports from './Reports';
import Users from './Users';
import Monitoring from './Monitoring';

import Logo from '../components/Logo';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'reports' | 'users' | 'monitoring'>('sales');

    if (!user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Safety wrapper to prevent one module from crashing the whole dashboard
    const renderModule = () => {
        try {
            switch (activeTab) {
                case 'sales': return <Sales />;
                case 'inventory': return <Inventory />;
                case 'reports': return user.role === 'admin' ? <Reports /> : <Sales />;
                case 'users': return user.role === 'admin' ? <Users /> : <Sales />;
                case 'monitoring': return user.role === 'admin' ? <Monitoring /> : <Sales />;
                default: return <Sales />;
            }
        } catch (error) {
            console.error("Module error:", error);
            return <div style={{ color: 'white', padding: '2rem', background: 'rgba(255,0,0,0.1)', borderRadius: '15px' }}>
                <h4>⚠️ Error al cargar el módulo</h4>
                <p>Ocurrió un problema técnico. Intenta recargar la página.</p>
            </div>;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                minWidth: '280px',
                background: 'var(--surface)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid var(--glass-border)',
                boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{ marginBottom: '3rem', paddingLeft: '10px' }}>
                    <Logo size={42} showText={true} />
                </div>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none' }}>
                        <li
                            onClick={() => setActiveTab('sales')}
                            style={{
                                padding: '15px 20px',
                                borderRadius: '12px',
                                marginBottom: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: activeTab === 'sales' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'sales' ? 'white' : 'var(--text-muted)',
                                transition: '0.3s',
                                fontWeight: '600'
                            }}
                        >
                            <span style={{ fontSize: '1.4rem' }}>🛒</span> Ventas
                        </li>
                        <li
                            onClick={() => setActiveTab('inventory')}
                            style={{
                                padding: '15px 20px',
                                borderRadius: '12px',
                                marginBottom: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: activeTab === 'inventory' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'inventory' ? 'white' : 'var(--text-muted)',
                                transition: '0.3s',
                                fontWeight: '600'
                            }}
                        >
                            <span style={{ fontSize: '1.4rem' }}>📦</span> Inventario
                        </li>

                        {user.role === 'admin' && (
                            <>
                                <li
                                    onClick={() => setActiveTab('reports')}
                                    style={{
                                        padding: '15px 20px',
                                        borderRadius: '12px',
                                        marginBottom: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: activeTab === 'reports' ? 'var(--primary)' : 'transparent',
                                        color: activeTab === 'reports' ? 'white' : 'var(--text-muted)',
                                        transition: '0.3s',
                                        fontWeight: '600'
                                    }}
                                >
                                    <span style={{ fontSize: '1.4rem' }}>📊</span> Reportes
                                </li>
                                <li
                                    onClick={() => setActiveTab('monitoring')}
                                    style={{
                                        padding: '15px 20px',
                                        borderRadius: '12px',
                                        marginBottom: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: activeTab === 'monitoring' ? 'var(--secondary)' : 'transparent',
                                        color: activeTab === 'monitoring' ? 'white' : 'var(--text-muted)',
                                        transition: '0.3s',
                                        fontWeight: '600'
                                    }}
                                >
                                    <span style={{ fontSize: '1.4rem' }}>👁️</span> Monitoreo
                                </li>
                                <li
                                    onClick={() => setActiveTab('users')}
                                    style={{
                                        padding: '15px 20px',
                                        borderRadius: '12px',
                                        marginBottom: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        background: activeTab === 'users' ? 'var(--primary)' : 'transparent',
                                        color: activeTab === 'users' ? 'white' : 'var(--text-muted)',
                                        transition: '0.3s',
                                        fontWeight: '600'
                                    }}
                                >
                                    <span style={{ fontSize: '1.4rem' }}>👥</span> Usuarios
                                </li>
                            </>
                        )}
                    </ul>
                </nav>

                <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sesión Activa</div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '4px' }}>{user.name}</div>
                        <div style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            background: user.role === 'admin' ? 'rgba(0,229,255,0.2)' : 'rgba(112,0,255,0.2)',
                            color: user.role === 'admin' ? 'var(--primary)' : 'var(--secondary)',
                            marginTop: '5px',
                            fontWeight: 'bold'
                        }}>{(user.role || 'desconocido').toUpperCase()}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'rgba(255,68,68,0.1)',
                            color: '#ff4444',
                            border: '1px solid rgba(255,68,68,0.3)',
                            fontWeight: '600',
                            transition: '0.3s'
                        }}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', background: 'linear-gradient(135deg, #0a0a0c 0%, #15151a 100%)', position: 'relative' }}>
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>
                            {activeTab === 'sales' && 'Módulo de Ventas'}
                            {activeTab === 'inventory' && 'Gestión de Inventario'}
                            {activeTab === 'reports' && 'Análisis y Reportes'}
                            {activeTab === 'users' && 'Control de Usuarios'}
                            {activeTab === 'monitoring' && 'Monitoreo de Empleados'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                            Gestiona tu óptica con precisión y eficiencia.
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: '0.8rem 1.5rem', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>📅</span>
                        <span style={{ fontWeight: '600' }}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </header>

                <div className="animate-fade-in" style={{ minHeight: '500px' }}>
                    {renderModule()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
