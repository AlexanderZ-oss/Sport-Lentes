import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Product } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import BarcodeScanner from '../components/BarcodeScanner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Sales: React.FC = () => {
    const { products, addSale, config, updateConfig, isDataLoading } = useData();
    const { user } = useAuth();
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState(config);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<{ product: Product; quantity: number; price?: number }[]>([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);
    const [saleType, setSaleType] = useState<'unit' | 'wholesale'>('unit');
    const [discount, setDiscount] = useState<number>(0);
    const [showScanner, setShowScanner] = useState(false);
    const [isCartVisible, setIsCartVisible] = useState(false); // For mobile cart toggle

    const [applyIgv, setApplyIgv] = useState(true);

    if (isDataLoading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                <p style={{ fontWeight: 700, letterSpacing: '1px' }}>SINCRONIZANDO PRECIOS Y STOCK...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            alert('Sin stock disponible');
            return;
        }

        const quantityToAdd = saleType === 'wholesale' ? 12 : 1;
        const priceToUse = saleType === 'wholesale' ? product.price * 0.8 : product.price;

        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
            if (existing.quantity + quantityToAdd > product.stock) {
                alert('No hay suficiente stock para esta operación');
                return;
            }
            setCart(cart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + quantityToAdd, price: item.price ?? priceToUse }
                    : item
            ));
        } else {
            setCart([...cart, { product, quantity: quantityToAdd, price: priceToUse }]);
        }
    };

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + ((item.price || item.product.price) * item.quantity), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - discount;
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const handleBarcodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const product = products.find(p => p.code === barcodeInput);
        if (product) {
            addToCart(product);
            setBarcodeInput('');
        } else {
            alert('Producto no encontrado');
        }
    };

    const handleScan = (code: string) => {
        setBarcodeInput(code);
        const product = products.find(p => p.code === code);
        if (product) {
            addToCart(product);
            setShowScanner(false);
            setBarcodeInput('');
        } else {
            alert(`Código escaneado: ${code} - Producto no encontrado`);
            setShowScanner(false);
        }
    };

    const [clientData, setClientData] = useState({ ruc: '' });

    const handleFinalizeSale = async () => {
        if (cart.length === 0) return;

        const saleData = {
            date: new Date().toISOString(),
            saleType,
            discount,
            client: clientData,
            items: cart.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price || item.product.price
            })),
            total: calculateTotal(),
            sellerId: user?.id || 'unknown',
            sellerName: user?.name || 'Vendedor'
        };

        try {
            console.log("Intentando procesar venta:", saleData);
            const realSaleId = await addSale(saleData, user?.name || 'Vendedor');
            setLastSale({ ...saleData, id: realSaleId });
            setCart([]);
            setClientData({ ruc: '' }); // Reset client data
            setShowReceipt(true);
            setIsCartVisible(false);
            setDiscount(0);
        } catch (error: any) {
            console.error("Detalle del error en venta:", error);
            alert(`⚠️ ERROR AL PROCESAR VENTA: ${error.message || 'No se pudo guardar en la nube'}. Verifica tu conexión.`);
        }
    };

    const handleTotalChange = (newTotal: number) => {
        const subtotal = calculateSubtotal();
        const newDiscount = Math.max(0, subtotal - newTotal);
        setDiscount(newDiscount);
    };

    const generatePDF = () => {
        if (!lastSale) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(config.name.toUpperCase(), 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`RUC: ${config.ruc}`, 105, 28, { align: "center" });
        doc.text(config.address, 105, 33, { align: "center" });
        doc.text(`Tel: ${config.phone}`, 105, 38, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        // Boleta Info
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`BOLETA DE VENTA ELECTRÓNICA`, 105, 55, { align: "center" });
        doc.text(`N° ${lastSale.id ? lastSale.id.toUpperCase() : '---'}`, 105, 62, { align: "center" });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Fecha:`, 20, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(`${new Date(lastSale.date).toLocaleString()}`, 40, 75);

        doc.setFont('helvetica', 'bold');
        doc.text(`Vendedor:`, 20, 82);
        doc.setFont('helvetica', 'normal');
        doc.text(`${lastSale.sellerName}`, 40, 82);

        // Client Info
        if (lastSale.client?.ruc) {
            doc.line(20, 88, 190, 88);
            doc.setFont('helvetica', 'bold');
            doc.text(`Identificación (RUC/DNI):`, 20, 95);
            doc.setFont('helvetica', 'normal');
            doc.text(`${lastSale.client.ruc}`, 70, 95);
        }

        // Table
        const tableColumn = ["Cant.", "Descripción", "P. Unit", "Total"];
        const tableRows: string[][] = [];

        lastSale.items.forEach((item: any) => {
            const ticketData = [
                item.quantity,
                item.name,
                `S/ ${item.price.toFixed(2)}`,
                `S/ ${(item.price * item.quantity).toFixed(2)}`
            ];
            tableRows.push(ticketData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: lastSale.client?.ruc ? 102 : 90,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Totals
        // @ts-ignore
        let finalY = doc.lastAutoTable.finalY + 10;

        if (applyIgv) {
            doc.text(`OP. GRAVADA:   S/ ${(lastSale.total * 0.8475).toFixed(2)}`, 140, finalY, { align: 'right' });
            doc.text(`IGV (18%):   S/ ${(lastSale.total * 0.1525).toFixed(2)}`, 140, finalY + 7, { align: 'right' });
            finalY += 15;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL:   S/ ${lastSale.total.toFixed(2)}`, 140, finalY, { align: 'right' });

        // Footer PDF
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text("Representación impresa de la Boleta de Venta Electrónica", 105, finalY + 15, { align: "center" });
        doc.text("Gracias por su preferencia", 105, finalY + 20, { align: "center" });

        doc.save(`Boleta_${lastSale.id}.pdf`);
    };

    const isMobile = window.innerWidth <= 768;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 350px',
            gap: isMobile ? '1rem' : '2rem',
            position: 'relative'
        }}>
            {/* Mobile Checkout Bar */}
            {isMobile && cart.length > 0 && (
                <button
                    onClick={() => setIsCartVisible(true)}
                    className="btn-primary"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        right: '20px',
                        zIndex: 1000,
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        borderRadius: '15px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🛒</span>
                        <span>{cart.length} productos</span>
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>S/ {calculateTotal().toFixed(2)}</span>
                </button>
            )}

            {showScanner && (
                <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            )}

            <div style={{ minWidth: 0 }}>
                {/* Search and Barcode row */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', width: isMobile ? '100%' : 'auto' }}>
                        <button
                            onClick={() => {
                                setEditingConfig(config);
                                setIsConfigModalOpen(true);
                            }}
                            className="btn-primary"
                            style={{ borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px' }}
                            title="Configurar RUC / Datos"
                        >
                            ⚙️
                        </button>
                        <form onSubmit={handleBarcodeSubmit} style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🏷️</span>
                            <input
                                type="text"
                                placeholder="Escanear (USB)"
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 107, 0, 0.05)',
                                    border: '2px solid var(--primary)',
                                    color: 'white',
                                    boxShadow: '0 0 15px rgba(255, 107, 0, 0.2)'
                                }}
                            />
                        </form>
                        <button
                            onClick={() => setShowScanner(true)}
                            className="btn-primary"
                            style={{ borderRadius: '12px', width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}
                            title="Escanear con Cámara"
                        >
                            📷
                        </button>
                    </div>
                </div>

                {/* Product Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: isMobile ? '0.8rem' : '1.5rem' }}>
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.includes(searchTerm)).map(product => (
                        <div key={product.id} className="glass-card product-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'center', transition: '0.3s' }}>
                            <div style={{ height: isMobile ? '120px' : '150px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {product.image ? (
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ fontSize: '2.5rem' }}>🕶️</div>
                                )}
                            </div>

                            <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <h4 style={{ marginBottom: '0.4rem', height: '2.5rem', overflow: 'hidden', fontSize: '0.9rem' }}>{product.name}</h4>
                                <div style={{ marginBottom: 'auto' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>S/ {product.price}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', margin: '0.5rem 0' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        background: product.stock < 5 ? 'rgba(255,0,0,0.1)' : 'rgba(68,255,68,0.1)',
                                        color: product.stock < 5 ? '#ff4444' : '#44ff44'
                                    }}>
                                        Stock: {product.stock}
                                    </span>
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                    className={product.stock <= 0 ? '' : 'btn-primary'}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        background: product.stock <= 0 ? '#444' : undefined,
                                        color: 'white',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {product.stock <= 0 ? 'Agotado' : 'Agregar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart / Summary - Responsive Sidebar/Overlay */}
            <div className={`glass-card ${isMobile ? (isCartVisible ? 'cart-visible' : 'cart-hidden') : ''}`} style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                height: isMobile ? '100vh' : 'calc(100vh - 100px)',
                position: isMobile ? 'fixed' : 'sticky',
                top: isMobile ? 0 : '20px',
                right: isMobile ? 0 : 'auto',
                left: isMobile ? 0 : 'auto',
                zIndex: isMobile ? 3000 : 100,
                borderRadius: isMobile ? 0 : '24px',
                transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isMobile && !isCartVisible ? 'translateX(100%)' : 'translateX(0)',
                visibility: isMobile && !isCartVisible ? 'hidden' : 'visible'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🛒</span> Carrito
                    </h3>
                    {isMobile && (
                        <button onClick={() => setIsCartVisible(false)} style={{ background: 'transparent', fontSize: '1.5rem', color: 'white' }}>✕</button>
                    )}
                </div>

                {/* Sale Type & Discount Controls */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--primary)' }}>⚙️ Opciones de Venta</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tipo:</span>
                        <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '8px', padding: '4px' }}>
                            <button
                                onClick={() => setSaleType('unit')}
                                style={{
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    background: saleType === 'unit' ? 'var(--primary)' : 'transparent',
                                    color: saleType === 'unit' ? 'black' : 'var(--text-muted)',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem'
                                }}
                            >
                                Unidad
                            </button>
                            <button
                                onClick={() => setSaleType('wholesale')}
                                style={{
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    background: saleType === 'wholesale' ? 'var(--secondary)' : 'transparent',
                                    color: saleType === 'wholesale' ? 'white' : 'var(--text-muted)',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem'
                                }}
                            >
                                Mayor
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Descuento:</span>
                        <input
                            type="number"
                            min="0"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            style={{
                                width: '80px',
                                padding: '6px',
                                borderRadius: '6px',
                                background: 'var(--surface)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                textAlign: 'right',
                                fontSize: '0.8rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="applyIgv"
                            checked={applyIgv}
                            onChange={(e) => setApplyIgv(e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="applyIgv" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            Separar IGV (18%)
                        </label>
                    </div>
                </div>

                {/* Client Data Section */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--primary)' }}>👤 Identificación Cliente</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <input
                            type="text"
                            placeholder="RUC / DNI del Cliente"
                            value={clientData.ruc}
                            onChange={(e) => setClientData({ ruc: e.target.value })}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.85rem' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
                            <p>Carrito vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="cart-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.product.name}</span>
                                    <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'transparent', color: '#ff4444' }}>✕</button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button onClick={() => {
                                            if (item.quantity > 1) {
                                                setCart(cart.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity - 1, price: i.price ?? i.product.price } : i));
                                            }
                                        }} style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--surface-hover)', color: 'white' }}>-</button>
                                        <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                        <button onClick={() => addToCart(item.product)} style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--surface-hover)', color: 'white' }}>+</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Precio Unit:</div>
                                        <input
                                            type="number"
                                            value={item.price || item.product.price}
                                            onChange={(e) => {
                                                const newPrice = Number(e.target.value);
                                                setCart(cart.map(i => i.product.id === item.product.id ? { ...i, price: newPrice } : i));
                                            }}
                                            style={{ width: '80px', padding: '4px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--secondary)', fontWeight: 'bold', borderRadius: '4px', textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '8px', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                                    Total: S/ {((item.price || item.product.price) * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ borderTop: '2px dashed var(--glass-border)', paddingTop: '1.5rem' }}>
                    {applyIgv && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                <span>Subtotal (OP. GRAVADA):</span>
                                <span>S/ {(calculateTotal() / 1.18).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                <span>IGV (18%):</span>
                                <span>S/ {(calculateTotal() - (calculateTotal() / 1.18)).toFixed(2)}</span>
                            </div>
                        </>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <span>Total:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: 'var(--primary)' }}>S/</span>
                            <input
                                type="number"
                                value={calculateTotal().toFixed(2)}
                                onChange={(e) => handleTotalChange(Number(e.target.value))}
                                style={{
                                    width: '120px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '2px solid var(--primary)',
                                    color: 'var(--primary)',
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    textAlign: 'right',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleFinalizeSale}
                        disabled={cart.length === 0}
                        className="btn-primary"
                        style={{ width: '100%', padding: '18px', fontSize: '1.2rem', borderRadius: '12px', boxShadow: '0 10px 20px rgba(255, 107, 0, 0.3)' }}
                    >
                        PAGAR VENTAS
                    </button>
                </div>
            </div>

            {/* Config Modal */}
            {isConfigModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Configuración de Empresa</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Nombre de Empresa</label>
                            <input type="text" value={editingConfig.name} onChange={e => setEditingConfig({ ...editingConfig, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>RUC</label>
                            <input type="text" value={editingConfig.ruc} onChange={e => setEditingConfig({ ...editingConfig, ruc: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Dirección</label>
                            <input type="text" value={editingConfig.address} onChange={e => setEditingConfig({ ...editingConfig, address: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Teléfono</label>
                            <input type="text" value={editingConfig.phone} onChange={e => setEditingConfig({ ...editingConfig, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setIsConfigModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white' }}>Cancelar</button>
                            <button onClick={() => { updateConfig(editingConfig); setIsConfigModalOpen(false); }} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '8px' }}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceipt && lastSale && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '400px', background: 'white', color: 'black', padding: '2rem', borderRadius: '0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ letterSpacing: '2px', color: 'black' }}>{config.name.toUpperCase()}</h2>
                            <p style={{ fontSize: '0.8rem' }}>RUC: {config.ruc}</p>
                            <p style={{ fontSize: '0.8rem' }}>{config.address}</p>
                            <hr style={{ margin: '1rem 0', borderColor: '#eee' }} />
                            <h3 style={{ margin: '0.5rem 0', color: 'black' }}>BOLETA ELECTRÓNICA</h3>
                            <p style={{ fontSize: '0.9rem' }}>{lastSale.id?.toUpperCase()}</p>
                        </div>

                        <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                            <p><strong>Fecha:</strong> {new Date(lastSale.date).toLocaleString()}</p>
                            <p><strong>Vendedor:</strong> {lastSale.sellerName}</p>
                            {lastSale.client?.ruc && <p><strong>DNI/RUC:</strong> {lastSale.client.ruc}</p>}
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            <thead style={{ borderBottom: '1px solid black' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '5px 0' }}>Cant.</th>
                                    <th style={{ textAlign: 'left', padding: '5px 0' }}>Desc.</th>
                                    <th style={{ textAlign: 'right', padding: '5px 0' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lastSale.items.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td style={{ padding: '5px 0' }}>{item.quantity}</td>
                                        <td style={{ padding: '5px 0' }}>{item.name}</td>
                                        <td style={{ textAlign: 'right', padding: '5px 0' }}>S/ {item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ borderTop: '1px solid black', paddingTop: '1rem' }}>
                            {applyIgv && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>OP. GRAVADA:</span>
                                        <span>S/ {(lastSale.total / 1.18).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>IGV (18%):</span>
                                        <span>S/ {(lastSale.total - (lastSale.total / 1.18)).toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                <span>TOTAL:</span>
                                <span>S/ {lastSale.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <p style={{ fontSize: '0.8rem' }}>¡Gracias por su compra!</p>
                            <div style={{ margin: '1rem 0', padding: '10px', background: '#f5f5f5', fontSize: '0.7rem' }}>
                                Escanee el código QR para validar su comprobante
                            </div>
                            <button
                                onClick={generatePDF}
                                style={{ marginTop: '0.5rem', width: '100%', padding: '12px', background: '#ff4444', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginBottom: '0.5rem' }}
                            >
                                📄 DESCARGAR PDF
                            </button>
                            <button
                                onClick={() => setShowReceipt(false)}
                                style={{ marginTop: '0.5rem', width: '100%', padding: '12px', background: 'black', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                            >
                                CERRAR Y CONTINUAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .product-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--primary);
                    box-shadow: 0 10px 30px rgba(255,107,0,0.2);
                }
                .cart-item {
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Sales;
