import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
    return (
        <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100%', height: '100%',
                background: 'url("https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80&w=1920") no-repeat center center/cover',
                opacity: 0.1,
                zIndex: -1,
                pointerEvents: 'none'
            }}></div>
            {/* Navigation */}
            <nav style={{ padding: '1.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,10,12,0.8)', backdropFilter: 'blur(10px)', position: 'fixed', width: '100%', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src="/logo.jpg" alt="Logo" style={{ height: '50px', borderRadius: '8px' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--primary)' }}>SPORT</span> LENTES
                    </div>
                </div>
                <div>
                    <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, padding: '0.6rem 1.5rem', background: 'var(--primary)', borderRadius: '8px', transition: '0.3s' }}>Iniciar Sesión</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                padding: '140px 5% 80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '4rem',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                <div style={{ maxWidth: '650px', zIndex: 1 }}>
                    <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary)', borderRadius: '50px', marginBottom: '1.5rem', fontWeight: '600', border: '1px solid rgba(0, 229, 255, 0.2)' }} className="animate-fade-in">
                        NUEVA COLECCIÓN 2026
                    </div>
                    <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', lineHeight: '1.1', marginBottom: '1.5rem' }} className="animate-fade-in">
                        Domina tu <br /><span className="gradient-text">Visión</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }} className="animate-fade-in">
                        Tecnología óptica avanzada para deportistas que no aceptan límites. Claridad, protección y estilo en un solo diseño.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }} className="animate-fade-in">
                        <Link to="/login" className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem', textDecoration: 'none', borderRadius: '50px' }}>Explorar Sistema</Link>
                        <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem 3rem', borderRadius: '50px', fontSize: '1.1rem', cursor: 'pointer', transition: '0.3s' }}>Ver Video</button>
                    </div>
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.2s', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: '-20px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.2, borderRadius: '50%' }}></div>
                    <img
                        src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600"
                        alt="Lentes deportivos premium"
                        style={{ width: '100%', maxWidth: '550px', borderRadius: '30px', transform: 'rotate(-5deg)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '80px 5%', background: 'var(--surface)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                    <div className="glass-card" style={{ padding: '3rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }} className="gradient-text">Nuestra Misión</h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                            Proporcionar a los atletas y entusiastas del deporte la mejor tecnología visual, garantizando protección, comodidad y un rendimiento superior a través de productos ópticos de alta calidad que superen sus expectativas.
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: '3rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }} className="gradient-text">Nuestra Visión</h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                            Ser la empresa líder a nivel nacional en el mercado de lentes deportivos, reconocida por nuestra innovación constante, excelencia en el servicio y por ser el aliado indispensable de cada deportista en su búsqueda de la victoria.
                        </p>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section style={{ padding: '60px 5%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Nuestra <span className="gradient-text">Colección</span></h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400" alt="Lente 1" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1577803645773-f933d55cd051?auto=format&fit=crop&q=80&w=400" alt="Lente 2" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1625591339762-430970bb6221?auto=format&fit=crop&q=80&w=400" alt="Lente 3" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1508296695146-25e7b52a154f?auto=format&fit=crop&q=80&w=400" alt="Lente 4" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://plus.unsplash.com/premium_photo-1675715923985-782f9479b1d3?auto=format&fit=crop&q=80&w=400" alt="Lente 5" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1591076482161-421a3aaee5f7?auto=format&fit=crop&q=80&w=400" alt="Lente 6" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=400" alt="Lente 7" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=400" alt="Lente 8" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?auto=format&fit=crop&q=80&w=400" alt="Lente 9" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400" alt="Lente 10" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1616147425420-22c608f44d8c?auto=format&fit=crop&q=80&w=400" alt="Lente 11" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&q=80&w=400" alt="Lente 12" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400" alt="Lente 13" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1508296695146-25e7b52a154f?auto=format&fit=crop&q=80&w=400" alt="Lente 14" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=400" alt="Lente 15" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                    <img src="https://images.unsplash.com/photo-1577803645773-f933d55cd051?auto=format&fit=crop&q=80&w=400" alt="Lente 16" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '15px' }} />
                </div>
            </section>

            {/* Footer */}
            <footer style={{ marginTop: 'auto', padding: '3rem 5%', background: '#050507', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <h3>SPORT LENTES</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Liderando la visión deportiva desde 2024.</p>
                    </div>
                    <div>
                        <h4>Contacto</h4>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Av. Principal 123, Ciudad</p>
                        <p style={{ color: 'var(--text-muted)' }}>info@sportlentes.com</p>
                    </div>
                </div>
            </footer>

            {/* WhatsApp Button */}
            <a href="https://wa.me/51951955969" target="_blank" rel="noopener noreferrer" className="whatsapp-float">
                <svg fill="currentColor" width="40" height="40" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.393l-.723 2.641 2.704-.709c.813.435 1.742.684 2.727.684 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767zm3.39 8.211c-.131.368-.661.704-1.077.747-.282.029-.646.046-1.04-.083-.243-.08-.553-.186-.964-.364-1.748-.755-2.887-2.534-2.974-2.651-.087-.116-.708-.941-.708-1.796 0-.855.449-1.274.608-1.442.159-.168.347-.209.463-.209.116 0 .231.002.332.006.107.004.252-.041.394.301.144.348.492 1.199.535 1.287.043.088.072.191.014.307-.058.116-.087.189-.174.289l-.261.303c-.087.093-.178.196-.076.372.102.176.452.748.969 1.209.667.593 1.23.778 1.406.865.176.087.28.072.384-.047.104-.119.444-.519.563-.695.119-.176.239-.148.403-.087.164.061 1.04.49 1.214.577.174.087.29.131.332.204.042.074.042.428-.089.796z" /></svg>
            </a>
        </div>
    );
};

export default LandingPage;
