import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await login(username, password);
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Credenciales incorrectas. Intente nuevamente.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative'
        }}>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100%', height: '100%',
                background: 'url("https://images.unsplash.com/photo-1577803645773-f933d55cd051?auto=format&fit=crop&q=80&w=1500") no-repeat center center/cover',
                opacity: 0.15,
                zIndex: -1,
                pointerEvents: 'none',
                filter: 'blur(3px)'
            }}></div>

            <div className="glass-card full-glass" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem', borderTop: '4px solid var(--primary)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--primary)' }}>SPORT</span> LENTES
                    </div>
                </div>

                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>
                    Bienvenido
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                    Ingresa tus credenciales para acceder al sistema
                </p>

                {error && (
                    <div className="animate-fade-in" style={{ background: 'rgba(255, 68, 68, 0.15)', color: '#ff6b6b', padding: '12px', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(255,68,68,0.2)', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ej. admin"
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                outline: 'none',
                                transition: '0.3s'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                outline: 'none',
                                transition: '0.3s'
                            }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                        Iniciar Sesión
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        ¿Olvidaste tu contraseña? <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Contactar Soporte</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
