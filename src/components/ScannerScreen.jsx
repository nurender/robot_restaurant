import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Utensils } from 'lucide-react';
import './Scanner.css'; // Component specific styling

const test = () => {
  const u = new SpeechSynthesisUtterance("Hello bhai test");
  u.lang = "en-US";
  window.speechSynthesis.speak(u);
};
const unlockSpeech = () => {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(" ");
  synth.speak(utter);
};

const ScannerScreen = ({ onTableDetected }) => {

  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Prevent double initialization
    if (scannerRef.current) return;

    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

    html5QrCode.start({ facingMode: "environment" }, config,
      (decodedText) => {
        // Success
        const mockTable = decodedText.replace(/[^0-9]/g, '');
        const num = mockTable ? parseInt(mockTable, 10) : Math.floor(Math.random() * 10) + 1;

        html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => { });
        onTableDetected(num || 5, 1);
      },
      (errorMessage) => {
        // ignore continuous scan error floods
      }
    ).catch((err) => {
      console.warn("Failed to start camera:", err);
      setError("Camera permission denied or unavailable.");
    });

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
              scannerRef.current.clear();
              scannerRef.current = null;
            }).catch(() => { scannerRef.current = null; });
          } else {
            scannerRef.current.clear();
            scannerRef.current = null;
          }
        } catch (e) {
          console.warn("Scanner cleanup warning:", e);
          scannerRef.current = null;
        }
      }
    };
  }, [onTableDetected]);

  return (
    <div className="scanner-screen animate-fade-in">
      <div className="scanner-header">
        <Utensils size={32} color="var(--accent-color)" />
        <h1>Welcome to AI Resto</h1>
        <p>Your futuristic dining experience</p>
      </div>

      <div className="scanner-container glass-panel">
        <div className="scanner-top-bar">
          <QrCode size={20} />
          <span>Scan Table QR</span>
        </div>
        <div id="qr-reader" className="qr-reader-override"></div>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="manual-entry">
        <p>Or tap below to start a demo session directly</p>
        <button className="button-primary-luxury" onClick={() => onTableDetected(5, 4)}>
          Skip & Demo (Table 5)
        </button>
        <button onClick={unlockSpeech}>Start</button>
        <button onClick={() => test("Hello sir")}>
          Speak
        </button>
      </div>
    </div>
  );
};

export default ScannerScreen;
