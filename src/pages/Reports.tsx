import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useData } from '../context/DataContext';

const Reports: React.FC = () => {
    const { sales, clearSalesData, config } = useData();

    // Process data for charts
    const salesByDay = sales.reduce((acc: any[], sale) => {
        const date = new Date(sale.date).toLocaleDateString();
        const existing = acc.find(item => item.date === date);
        if (existing) {
            existing.total += sale.total;
        } else {
            acc.push({ date, total: sale.total });
        }
        return acc;
    }, []);

    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalTransactions = sales.length;

    const downloadReport = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`Reporte de Ventas - ${config.name}`, 14, 22);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);

        // Summary
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.text(`Ingresos Totales: S/ ${totalRevenue.toFixed(2)}`, 14, 45);
        doc.text(`Transacciones: ${totalTransactions}`, 14, 52);
        doc.text(`Ticket Promedio: S/ ${(totalTransactions > 0 ? (totalRevenue / totalTransactions) : 0).toFixed(2)}`, 14, 59);

        // Table
        const tableColumn = ["#", "Fecha", "Vendedor", "Items", "Total"];
        const tableRows: (string | number)[][] = [];

        sales.forEach((sale, index) => {
            const saleData = [
                index + 1,
                new Date(sale.date).toLocaleDateString(),
                sale.sellerName || 'N/A',
                sale.items?.length || 0,
                `S/ ${(sale.total || 0).toFixed(2)}`
            ];
            tableRows.push(saleData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [255, 107, 0], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save(`Reporte_Ventas_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const handleClearData = () => {
        if (window.confirm('⚠️ ¿Estás seguro de eliminar todos los datos de ventas y registros?\n\nEsta acción NO afectará el inventario de productos, pero eliminará permanentemente:\n- Historial de ventas\n- Registros de actividad\n\n¿Deseas continuar?')) {
            clearSalesData();
            alert('✅ Datos de ventas y registros eliminados correctamente.');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>Dashboard Financiero</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={downloadReport} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📄</span> Descargar Reporte
                    </button>
                    <button
                        onClick={handleClearData}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0.8rem 1.5rem',
                            background: 'rgba(255, 68, 68, 0.1)',
                            color: '#ff4444',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: '0.3s'
                        }}
                    >
                        <span>🗑️</span> Limpiar Datos
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ingresos Totales</p>
                    <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>S/ {totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ventas Totales</p>
                    <h3 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>{totalTransactions}</h3>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ticket Promedio</p>
                    <h3 style={{ fontSize: '2rem' }}>S/ {totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : 0}</h3>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div className="glass-card" style={{ height: '400px' }}>
                    <h4 style={{ marginBottom: '1.5rem' }}>Tendencia de Ventas (Diaria)</h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={salesByDay}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--primary)' }}
                            />
                            <Area type="monotone" dataKey="total" stroke="var(--primary)" fillOpacity={1} fill="url(#colorTotal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1.5rem' }}>Últimas Transacciones</h4>
                <div className="glass-card" style={{ padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Artículos</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!sales || sales.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No hay ventas registradas
                                    </td>
                                </tr>
                            ) : (
                                sales.slice(-5).reverse().map((sale, idx) => (
                                    <tr key={sale.id || idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1rem' }}>{new Date(sale.date).toLocaleString()}</td>
                                        <td style={{ padding: '1rem' }}>{sale.items?.length || 0} productos</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>S/ {(sale.total || 0).toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
