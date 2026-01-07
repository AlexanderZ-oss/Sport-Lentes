import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Product } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import BarcodeScanner from '../components/BarcodeScanner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveToGoogleSheets } from '../services/googleSheets';

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
    const [clientData, setClientData] = useState({ ruc: '' });
    const [totalInputValue, setTotalInputValue] = useState<string>(''); // For flexible price entry
    const [isProcessing, setIsProcessing] = useState(false);

    const [applyIgv, setApplyIgv] = useState(true);

    // Subtle loading indicator instead of full-screen blocker
    const LoadingIndicator = isDataLoading ? (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--primary)',
            color: 'black',
            padding: '8px 15px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(0,229,255,0.4)',
            animation: 'pulse 1.5s infinite'
        }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid black', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Actualizando...
            <style>{`
                @keyframes pulse { 0% { opacity: 0.8; } 50% { opacity: 1; } 100% { opacity: 0.8; } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    ) : null;

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

    // Update the total input value whenever the cart or sale type changes
    React.useEffect(() => {
        const total = calculateTotal();
        // Only update if the user isn't currently typing (not focused)
        if (document.activeElement?.id !== 'total-to-pay-input') {
            setTotalInputValue(total.toFixed(2));
        }
    }, [cart, saleType, discount]);

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

    const handleFinalizeSale = async () => {
        if (cart.length === 0 || isProcessing) return;

        setIsProcessing(true);
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
            const dataWithId = { ...saleData, id: realSaleId };
            setLastSale(dataWithId);

            // Send to Google Sheets (Background - don't let it block)
            try {
                const sheetData = {
                    id: realSaleId,
                    date: new Date().toLocaleString(),
                    total: dataWithId.total,
                    seller: user?.name || 'Vendedor',
                    client: clientData.ruc || 'Anonimo',
                    items: cart.map(i => `${i.product.name} (x${i.quantity})`).join(', '),
                    paymentType: saleType
                };
                saveToGoogleSheets(sheetData).catch(err => console.error("Error Sheets:", err));
            } catch (sheetErr) {
                console.error("Critical Sheets Error:", sheetErr);
            }

            setCart([]);
            setClientData({ ruc: '' });
            setDiscount(0);
            setShowReceipt(true);
            setIsCartVisible(false);
        } catch (error: any) {
            console.error("Detalle del error en venta:", error);
            alert(`⚠️ ERROR AL PROCESAR VENTA: ${error.message || 'No se pudo guardar en la nube'}. Verifica tu conexión.`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTotalChange = (value: string) => {
        setTotalInputValue(value);
        const newTotal = parseFloat(value);
        if (!isNaN(newTotal)) {
            const subtotal = calculateSubtotal();
            const newDiscount = Math.max(0, subtotal - newTotal);
            setDiscount(newDiscount);
        }
    };

    const createPDFDoc = () => {
        if (!lastSale) return null;

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
            const opGravada = lastSale.total / 1.18;
            const igv = lastSale.total - opGravada;
            doc.text(`OP. GRAVADA:   S/ ${opGravada.toFixed(2)}`, 140, finalY, { align: 'right' });
            doc.text(`IGV (18%):   S/ ${igv.toFixed(2)}`, 140, finalY + 7, { align: 'right' });
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

        return doc;
    };

    const generatePDF = () => {
        const doc = createPDFDoc();
        if (doc) {
            doc.save(`Boleta_${lastSale.id}.pdf`);
        }
    };

    const handlePrint = () => {
        const doc = createPDFDoc();
        if (doc) {
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        }
    };

    const isMobile = window.innerWidth <= 768;

    return (
        <div style={{ height: 'calc(100vh - 100px)', position: 'relative' }}>
            {LoadingIndicator}

            {/* Mobile Cart Toggle */}
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

            <div style={{
                marginRight: isMobile ? '0' : '400px', // Make space for fixed cart
                paddingRight: isMobile ? '0' : '2rem',
                transition: 'margin-right 0.3s ease'
            }}>
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

            {/* Cart Sidebar - Fixed Right */}
            <div className={`glass-card ${isMobile ? (isCartVisible ? 'cart-visible' : 'cart-hidden') : ''}`} style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: isMobile ? '100%' : '380px',
                zIndex: isMobile ? 3000 : 1000,
                backgroundColor: '#1e293b', // Solid background color for visibility
                borderLeft: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
                transform: isMobile && !isCartVisible ? 'translateX(100%)' : 'translateX(0)',
                boxShadow: '-5px 0 25px rgba(0,0,0,0.5)',
                borderRadius: isMobile ? '0' : '20px 0 0 20px',
                visibility: isMobile && !isCartVisible ? 'hidden' : 'visible'
            }}>
                {/* Cart Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
                        🛒 Nueva Venta
                    </h3>
                    {isMobile && (
                        <button onClick={() => setIsCartVisible(false)} style={{ background: 'transparent', color: 'white', fontSize: '1.5rem' }}>✕</button>
                    )}
                </div>

                {/* Cart Items & Scrollable Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {/* Settings Panel */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tipo de Venta</span>
                            <div style={{ display: 'flex', background: 'var(--background)', borderRadius: '8px', padding: '2px' }}>
                                <button
                                    onClick={() => setSaleType('unit')}
                                    style={{ padding: '5px 10px', fontSize: '0.8rem', borderRadius: '6px', background: saleType === 'unit' ? 'var(--primary)' : 'transparent', color: saleType === 'unit' ? 'black' : 'var(--text-muted)' }}
                                >Unidad</button>
                                <button
                                    onClick={() => setSaleType('wholesale')}
                                    style={{ padding: '5px 10px', fontSize: '0.8rem', borderRadius: '6px', background: saleType === 'wholesale' ? 'var(--secondary)' : 'transparent', color: saleType === 'wholesale' ? 'white' : 'var(--text-muted)' }}
                                >Mayor</button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="RUC / DNI Cliente (Opcional)"
                                value={clientData.ruc}
                                onChange={(e) => setClientData({ ruc: e.target.value })}
                                style={{ width: '100%', padding: '8px', fontSize: '0.85rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="applyIgv"
                                checked={applyIgv}
                                onChange={(e) => setApplyIgv(e.target.checked)}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <label htmlFor="applyIgv" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Separar IGV (18%) en boleta</label>
                        </div>
                    </div>

                    {/* Products List */}
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛍️</div>
                            <p>Agrega productos para vender</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cart.map(item => (
                                <div key={item.product.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'white', maxWidth: '85%' }}>{item.product.name}</span>
                                        <button onClick={() => removeFromCart(item.product.id)} style={{ color: '#ff4444', background: 'transparent', padding: 0 }}>✕</button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--background)', borderRadius: '6px', padding: '2px' }}>
                                            <button onClick={() => {
                                                if (item.quantity > 1) {
                                                    setCart(cart.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity - 1 } : i));
                                                }
                                            }} style={{ width: '24px', height: '24px', background: 'var(--surface-hover)', borderRadius: '4px', color: 'white' }}>-</button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (val > 0) {
                                                        if (val > item.product.stock) {
                                                            alert(`Solo hay ${item.product.stock} unidades en stock`);
                                                            return;
                                                        }
                                                        setCart(cart.map(i => i.product.id === item.product.id ? { ...i, quantity: val } : i));
                                                    }
                                                }}
                                                style={{ width: '40px', textAlign: 'center', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold' }}
                                            />
                                            <button onClick={() => {
                                                if (item.quantity < item.product.stock) {
                                                    setCart(cart.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity + 1 } : i));
                                                } else {
                                                    alert('No hay suficiente stock');
                                                }
                                            }} style={{ width: '24px', height: '24px', background: 'var(--surface-hover)', borderRadius: '4px', color: 'white' }}>+</button>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '5px' }}>Total:</span>
                                            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>S/ {((item.price || item.product.price) * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Totals & Pay */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>TOTAL A PAGAR:</span>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--background)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--primary)', cursor: 'text' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginRight: '5px' }}>S/</span>
                            <input
                                id="total-to-pay-input"
                                type="text"
                                inputMode="decimal"
                                value={totalInputValue}
                                onChange={(e) => handleTotalChange(e.target.value)}
                                onBlur={() => {
                                    // When leaving the field, format it properly
                                    const num = parseFloat(totalInputValue);
                                    if (!isNaN(num)) {
                                        setTotalInputValue(num.toFixed(2));
                                    } else {
                                        setTotalInputValue(calculateTotal().toFixed(2));
                                    }
                                }}
                                style={{ width: '80px', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'right', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleFinalizeSale}
                        disabled={cart.length === 0}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: '10px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            opacity: cart.length === 0 ? 0.5 : 1,
                            cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <span>{isProcessing ? '⏳' : '💳'}</span> {isProcessing ? 'PROCESANDO...' : 'FINALIZAR PAGO'}
                    </button>
                </div>
            </div>

            {/* Config Modal */}
            {
                isConfigModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3100 }}>
                        <div className="glass-card" style={{ width: '90%', maxWidth: '450px', padding: '2.5rem', border: '1px solid var(--primary)' }}>
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
                )
            }

            {/* Receipt Modal */}
            {
                showReceipt && lastSale && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div className="animate-fade-in" style={{
                            width: '95%',
                            maxWidth: '450px',
                            background: 'white',
                            color: 'black',
                            padding: isMobile ? '1.5rem' : '2.5rem',
                            borderRadius: '20px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                            position: 'relative'
                        }}>
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
                                            <td style={{ textAlign: 'right', padding: '5px 0' }}>S/ {(item.price * item.quantity).toFixed(2)}</td>
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
                                    style={{ marginTop: '0.5rem', width: '100%', padding: '12px', background: '#ff4444', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                                >
                                    📄 DESCARGAR PDF
                                </button>
                                <button
                                    onClick={handlePrint}
                                    style={{ marginTop: '0.5rem', width: '100%', padding: '12px', background: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                                >
                                    🖨️ IMPRIMIR
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
                )
            }

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
        </div >
    );
};

export default Sales;
