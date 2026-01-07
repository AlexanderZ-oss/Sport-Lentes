import React from 'react';
import { useData } from '../context/DataContext';

const Monitoring: React.FC = () => {
    const { logs } = useData();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>Monitoreo en Tiempo Real</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="pulse" style={{ width: '10px', height: '10px', background: '#44ff44', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Conexión Activa</span>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0' }}>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Hora</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Usuario</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Acción</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!logs || logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No hay actividad registrada
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.3s' }} className="log-row">
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>{log.user}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                background: log.action.includes('Venta') ? 'rgba(68,255,68,0.1)' : 'rgba(255,107,0,0.1)',
                                                color: log.action.includes('Venta') ? '#44ff44' : 'var(--primary)',
                                                fontWeight: 'bold'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                            {log.details}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .pulse {
                    box-shadow: 0 0 0 0 rgba(68, 255, 68, 0.7);
                    animation: pulse-green 2s infinite;
                }
                @keyframes pulse-green {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(68, 255, 68, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(68, 255, 68, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(68, 255, 68, 0); }
                }
                .log-row:hover {
                    background: rgba(255,255,255,0.02);
                }
            `}</style>
        </div>
    );
};

export default Monitoring;
