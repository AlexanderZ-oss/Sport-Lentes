import React, { useState } from 'react';
import { useData, type Product } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import BarcodeScanner from '../components/BarcodeScanner';

const Inventory: React.FC = () => {
    const { products, addProduct, updateStock, deleteProduct, updateProduct } = useData();
    const { user } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', code: '', price: 0, stock: 0, category: 'General', image: '' });
    const [showScanner, setShowScanner] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addProduct(newProduct, user?.name || 'Sistema');
            setIsAdding(false);
            setNewProduct({ name: '', code: '', price: 0, stock: 0, category: 'General', image: '' });
        } catch (error: any) {
            const errorMessage = error.message || "Error desconocido al guardar en la nube.";
            alert(`⚠️ ERROR AL GUARDAR: ${errorMessage}`);
            console.error(error);
        }
    };

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleScan = (code: string) => {
        setNewProduct(prev => ({ ...prev, code }));
        setShowScanner(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Limitar tamaño de imagen (ej: 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("⚠️ La imagen es demasiado pesada (máximo 2MB). Por favor, usa una imagen más pequeña.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        try {
            await updateProduct(editingProduct.id, {
                name: editingProduct.name,
                code: editingProduct.code,
                price: Number(editingProduct.price),
                stock: Number(editingProduct.stock),
                category: editingProduct.category,
                image: editingProduct.image
            }, user?.name || 'Sistema');
            setEditingProduct(null);
        } catch (error: any) {
            alert(`❌ Error al actualizar producto: ${error.message || ''}`);
        }
    };



    return (
        <div>
            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
                >
                    <img src={selectedImage} alt="Full View" style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: '15px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }} />
                </div>
            )}

            {showScanner && (
                <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>Gestión de Productos</h3>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <button onClick={() => setIsAdding(!isAdding)} className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                        {isAdding ? 'Cancelar' : '+ Agregar Producto'}
                    </button>
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleAddProduct} className="glass-card animate-fade-in" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '2rem', padding: '2rem' }}>
                    {/* Left Col: Image Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '1rem', border: '1px dashed var(--glass-border)' }}>
                        {newProduct.image ? (
                            <img src={newProduct.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '10px' }} />
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                                <p>Sin Imagen</p>
                            </div>
                        )}
                    </div>

                    {/* Right Col: Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nombre del Producto</label>
                            <input
                                type="text"
                                required
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Imagen del Producto</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="O pegar URL..."
                                value={newProduct.image}
                                onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                style={{ width: '100%', marginTop: '0.5rem', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Código de Barras</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    required
                                    value={newProduct.code}
                                    onChange={e => setNewProduct({ ...newProduct, code: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                />
                                <button type="button" onClick={() => setShowScanner(true)} style={{ background: 'var(--surface-hover)', padding: '0 12px', borderRadius: '8px', color: 'white' }}>📷</button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Categoría</label>
                            <select
                                value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                            >
                                <option value="General">General</option>
                                <option value="Lentes de Sol">Lentes de Sol</option>
                                <option value="Lentes Ópticos">Lentes Ópticos</option>
                                <option value="Accesorios">Accesorios</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Precio (S/)</label>
                            <input
                                type="number"
                                required
                                value={newProduct.price}
                                onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Stock Inicial</label>
                            <input
                                type="number"
                                required
                                value={newProduct.stock}
                                onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '1rem', padding: '15px', borderRadius: '10px' }}>Guardar e Inventariar</button>
                    </div>
                </form>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <form onSubmit={handleUpdateProduct} className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 2fr', gap: '1.5rem', padding: '2rem' }}>
                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between' }}>
                            <h4>Editar Producto</h4>
                            <button type="button" onClick={() => setEditingProduct(null)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                        {/* Left Col: Image Preview */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '1rem', border: '1px dashed var(--glass-border)' }}>
                            {editingProduct.image ? (
                                <img src={editingProduct.image} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'contain', borderRadius: '10px' }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📷</div>
                                    <p style={{ fontSize: '0.8rem' }}>Sin Imagen</p>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nombre</label>
                                <input type="text" required value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Precio (S/)</label>
                                <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock</label>
                                <input type="number" required value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '12px', borderRadius: '8px' }}>Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card" style={{ padding: 0, overflow: 'auto', borderRadius: '15px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        <tr>
                            <th style={{ padding: '1.2rem' }}>Img</th>
                            <th style={{ padding: '1.2rem' }}>Código</th>
                            <th style={{ padding: '1.2rem' }}>Producto</th>
                            <th style={{ padding: '1.2rem' }}>Categoría</th>
                            <th style={{ padding: '1.2rem' }}>Stock</th>
                            <th style={{ padding: '1.2rem' }}>Precio</th>
                            <th style={{ padding: '1.2rem' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts && Array.isArray(filteredProducts) && filteredProducts.map((p: any) => (
                            <tr key={p?.id || Math.random().toString()} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.3s' }}>
                                <td style={{ padding: '1rem' }}>
                                    {p?.image ? (
                                        <div onClick={() => setSelectedImage(p.image || null)} style={{ cursor: 'pointer' }}>
                                            <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👓</div>
                                    )}
                                </td>
                                <td style={{ padding: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>{p?.code || '---'}</td>
                                <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{p?.name || 'Producto sin nombre'}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '0.8rem' }}>
                                        {p?.category || 'General'}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <span style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        background: (p?.stock || 0) < 5 ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)',
                                        color: (p?.stock || 0) < 5 ? '#ff4444' : '#44ff44',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }}>
                                        {p?.stock || 0} uds
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>S/ {Number(p?.price || 0).toFixed(2)}</span>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setEditingProduct(p)}
                                            style={{ background: 'var(--surface-hover)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                                            title="Editar Producto"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await updateStock(p.id, 1, user?.name || 'Sistema');
                                                } catch (e) {
                                                    alert("Error al actualizar stock en la nube");
                                                }
                                            }}
                                            style={{ background: 'var(--surface-hover)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', border: 'none' }}
                                            title="Agregar Stock"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await updateStock(p.id, -1, user?.name || 'Sistema');
                                                } catch (e) {
                                                    alert("Error al actualizar stock en la nube");
                                                }
                                            }}
                                            style={{ background: 'var(--surface-hover)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', border: 'none' }}
                                            title="Reducir Stock"
                                        >
                                            -
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`¿Estás seguro de que quieres eliminar "${p.name}"? Esta acción no se puede deshacer.`)) {
                                                    deleteProduct(p.id, user?.name || 'Sistema');
                                                }
                                            }}
                                            style={{
                                                background: 'rgba(255, 68, 68, 0.15)',
                                                color: '#ff4444',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                border: '1px solid rgba(255, 68, 68, 0.3)'
                                            }}
                                            title="Eliminar Producto Permanentemente"
                                        >
                                            🗑️
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

export default Inventory;
