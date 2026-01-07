import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                onScan(decodedText);
                scanner.clear();
            },
            (errorMessage) => {
                console.log(errorMessage);
            }
        );

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear html5-qrcode scanner. ", error));
        };
    }, [onScan]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', position: 'relative', width: '90%', maxWidth: '500px' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    ✕
                </button>
                <h3 style={{ color: 'black', textAlign: 'center', marginBottom: '1rem' }}>Escanear Código</h3>
                <div id="reader"></div>
                <p style={{ color: '#666', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                    Sitúe el código de barras frente a la cámara
                </p>
            </div>
        </div>
    );
};

export default BarcodeScanner;
