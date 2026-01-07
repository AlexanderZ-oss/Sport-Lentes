import React from 'react';

const Logo: React.FC<{ size?: number; showText?: boolean }> = ({ size = 40, showText = true }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff4b2b" />
                        <stop offset="100%" stopColor="#ff416c" />
                    </linearGradient>
                </defs>
                <path d="M10 50 L30 80 L90 20" stroke="url(#grad1)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M10 50 L30 20 L60 20" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="8" strokeLinecap="round" />
                <circle cx="75" cy="45" r="15" stroke="#ffffff" strokeWidth="6" />
            </svg>
            {showText && (
                <div style={{ fontWeight: 800, fontSize: `${size * 0.6}px`, lineHeight: 1, letterSpacing: '-1px' }}>
                    <span style={{ color: '#ff4b2b' }}>SPORT</span>
                    <span style={{ color: 'white' }}>LENTES</span>
                </div>
            )}
        </div>
    );
};

export default Logo;
