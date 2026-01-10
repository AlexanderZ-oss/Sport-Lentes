import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { supabase } from '../supabase/config';

const AdminSettings: React.FC = () => {
    const { config, updateConfig } = useData();
    const [editingConfig, setEditingConfig] = useState(config);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(() => {
        const saved = localStorage.getItem('db_connection_status');
        return saved ? JSON.parse(saved) : null;
    });
    const [autoReconnect, setAutoReconnect] = useState(false);

    // Actualizar editingConfig cuando config cambie
    useEffect(() => {
        setEditingConfig(config);
    }, [config]);

    // Persistir estado de conexión
    useEffect(() => {
        if (testResult) {
            localStorage.setItem('db_connection_status', JSON.stringify(testResult));
        }
    }, [testResult]);

    const handleSave = async () => {
        try {
            await updateConfig(editingConfig);
            alert('✅ Configuración guardada correctamente');
        } catch (error) {
            alert('❌ Error al guardar: ' + error);
        }
    };

    const testConnection = async (retryCount = 0): Promise<void> => {
        setIsTesting(true);
        if (retryCount === 0) {
            setTestResult(null);
        }

        try {
            // Test Supabase connection by trying to read the settings table
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('id', 'app_config')
                .single();

            if (!error && data) {
                setTestResult({ success: true, message: '✅ Conexión Exitosa: Base de datos Supabase operativa y sincronizada.' });
                setAutoReconnect(false);
            } else if (error && error.code === 'PGRST116') {
                setTestResult({ success: true, message: '✅ Conexión Establecida (Creando configuración inicial...)' });
                // Crear documento inicial si no existe
                await updateConfig(editingConfig);
                setAutoReconnect(false);
            } else {
                throw error;
            }
        } catch (error: any) {
            console.error("Test connection error:", error);
            const errorMsg = error.message || 'No se pudo contactar con Supabase.';

            if (retryCount < 3 && autoReconnect) {
                setTestResult({ success: false, message: `⚠️ Reintentando conexión... (${retryCount + 1}/3)` });
                setTimeout(() => testConnection(retryCount + 1), 2000);
            } else {
                setTestResult({ success: false, message: '❌ Error de Conexión: ' + errorMsg });
                setAutoReconnect(false);
            }
        } finally {
            if (retryCount === 0 || !autoReconnect) {
                setIsTesting(false);
            }
        }
    };

    const handleAutoReconnect = () => {
        setAutoReconnect(true);
        testConnection(0);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    ⚙️ Ajustes del Sistema
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nombre de la Empresa</label>
                        <input
                            type="text"
                            value={editingConfig.name}
                            onChange={e => setEditingConfig({ ...editingConfig, name: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>RUC / Identificación</label>
                        <input
                            type="text"
                            value={editingConfig.ruc}
                            onChange={e => setEditingConfig({ ...editingConfig, ruc: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Dirección Física</label>
                        <input
                            type="text"
                            value={editingConfig.address}
                            onChange={e => setEditingConfig({ ...editingConfig, address: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Teléfono de Contacto</label>
                        <input
                            type="text"
                            value={editingConfig.phone}
                            onChange={e => setEditingConfig({ ...editingConfig, phone: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="btn-primary"
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                >
                    Guardar Cambios Globales
                </button>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🌐 Estado de Infraestructura
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Verifica si la aplicación tiene acceso a la base de datos de Supabase en tiempo real.
                </p>

                <div style={{
                    padding: '1.5rem',
                    borderRadius: '15px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--glass-border)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Servicio de Base de Datos:</span>
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: 'rgba(0, 229, 255, 0.1)',
                            color: 'var(--primary)',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>SUPABASE CLOUD UNIT</span>
                    </div>

                    {testResult && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '10px',
                            background: testResult.success ? 'rgba(68, 255, 68, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                            color: testResult.success ? '#44ff44' : '#ff4444',
                            fontSize: '0.9rem',
                            border: `1px solid ${testResult.success ? 'rgba(68, 255, 68, 0.2)' : 'rgba(255, 68, 68, 0.2)'}`
                        }}>
                            {testResult.message}
                        </div>
                    )}
                </div>

                <button
                    onClick={testConnection}
                    disabled={isTesting}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'var(--background)',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        borderRadius: '12px',
                        cursor: isTesting ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        transition: '0.3s',
                        marginBottom: '1rem'
                    }}
                >
                    {isTesting ? '🔄 Verificando...' : '📡 Probar Conexión a Supabase'}
                </button>

                <button
                    onClick={handleAutoReconnect}
                    disabled={isTesting}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: testResult?.success ? 'rgba(0, 255, 0, 0.1)' : 'var(--background)',
                        border: testResult?.success ? '1px solid rgba(0, 255, 0, 0.3)' : '1px solid rgba(255, 150, 0, 0.5)',
                        color: testResult?.success ? '#44ff44' : '#ff9944',
                        borderRadius: '12px',
                        cursor: isTesting ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        transition: '0.3s'
                    }}
                >
                    {isTesting ? '🔁 Reconectando...' : testResult?.success ? '✓ Conexión Establecida' : '🔁 Auto-Reconectar (3 intentos)'}
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
