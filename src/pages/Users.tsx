import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role, User } from '../context/AuthContext';

const Users: React.FC = () => {
    const { usersList, addUser, deleteUser, toggleUserStatus, updateUser } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState<{ name: string; username: string; password: string; role: Role; verifyCode: string }>({
        name: '',
        username: '',
        password: '',
        role: 'employee',
        verifyCode: ''
    });

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();

        // Security check for registration code
        if (newUser.verifyCode !== 'SL-2026') {
            alert('❌ CÓDIGO DE VERIFICACIÓN INCORRECTO. No tienes permiso para registrar este usuario.');
            return;
        }

        addUser({ name: newUser.name, username: newUser.username, password: newUser.password, role: newUser.role, status: 'active' });
        setIsAdding(false);
        setNewUser({ name: '', username: '', password: '', role: 'employee', verifyCode: '' });
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            await updateUser(editingUser.id, {
                name: editingUser.name,
                password: editingUser.password,
                role: editingUser.role
            });
            setEditingUser(null);
        } catch {
            alert("❌ Error al actualizar usuario");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>Gestión de Usuarios</h3>
                <button onClick={() => setIsAdding(!isAdding)} className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '10px' }}>
                    {isAdding ? 'Cancelar' : '+ Nuevo Usuario'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAddUser} className="glass-card animate-fade-in" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nombre Completo</label>
                        <input
                            type="text"
                            required
                            value={newUser.name}
                            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Usuario</label>
                        <input
                            type="text"
                            required
                            value={newUser.username}
                            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Contraseña</label>
                        <input
                            type="password"
                            required
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rol</label>
                        <select
                            value={newUser.role || 'employee'}
                            onChange={e => setNewUser({ ...newUser, role: e.target.value as Role })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                        >
                            <option value="employee">Empleado</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>CÓDIGO DE SEGURIDAD (Obligatorio)</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Ingrese el código o genere uno automáticamente"
                                required
                                value={newUser.verifyCode}
                                onChange={e => setNewUser({ ...newUser, verifyCode: e.target.value })}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 107, 0, 0.1)',
                                    border: '2px solid var(--primary)',
                                    color: 'white'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setNewUser(prev => ({ ...prev, verifyCode: 'SL-2026' }))}
                                style={{
                                    padding: '0 1.5rem',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                            >
                                ⚡ Generar Código
                            </button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                            * Si no tiene el código, puede generarlo automáticamente para autorizar el registro.
                        </p>
                    </div>
                    <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '1rem', padding: '15px', borderRadius: '10px' }}>Crear Usuario</button>
                </form>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <form onSubmit={handleUpdateUser} className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h4>Editar Usuario: {editingUser.username}</h4>
                            <button type="button" onClick={() => setEditingUser(null)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nombre Completo</label>
                            <input type="text" required value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nueva Contraseña</label>
                            <input type="text" required value={editingUser.password} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rol</label>
                            <select value={editingUser.role || 'employee'} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as Role })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}>
                                <option value="employee">Empleado</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary" style={{ padding: '12px', borderRadius: '8px' }}>Guardar Cambios</button>
                    </form>
                </div>
            )}

            <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        <tr>
                            <th style={{ padding: '1.2rem' }}>Nombre</th>
                            <th style={{ padding: '1.2rem' }}>Usuario</th>
                            <th style={{ padding: '1.2rem' }}>Rol</th>
                            <th style={{ padding: '1.2rem' }}>Estado</th>
                            <th style={{ padding: '1.2rem' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.3s' }}>
                                <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{u.name}</td>
                                <td style={{ padding: '1.2rem' }}>{u.username}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        background: u.role === 'admin' ? 'rgba(255,107,0,0.2)' : 'rgba(0,123,255,0.2)',
                                        color: u.role === 'admin' ? 'var(--primary)' : 'var(--secondary)'
                                    }}>
                                        {u.role ? u.role.toUpperCase() : 'UNKNOWN'}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <span style={{
                                        color: u.status === 'active' ? '#44ff44' : '#ff4444',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.status === 'active' ? '#44ff44' : '#ff4444' }}></div>
                                        {u.status === 'active' ? 'Activo' : 'Suspendido'}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setEditingUser(u)}
                                            style={{ background: 'var(--surface-hover)', color: 'white', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            onClick={() => toggleUserStatus(u.id)}
                                            style={{
                                                background: 'var(--surface-hover)',
                                                color: u.status === 'active' ? '#ffaa00' : '#44ff44',
                                                border: '1px solid var(--glass-border)',
                                                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer'
                                            }}
                                        >
                                            {u.status === 'active' ? 'Suspender' : 'Activar'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Estás seguro de eliminar este usuario?')) deleteUser(u.id);
                                            }}
                                            style={{
                                                background: 'rgba(255,68,68,0.1)',
                                                color: '#ff4444',
                                                border: '1px solid rgba(255,68,68,0.3)',
                                                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer'
                                            }}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
