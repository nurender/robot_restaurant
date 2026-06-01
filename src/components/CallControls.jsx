import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, Video, VideoOff, Mic, MicOff, ShoppingCart, Settings, PhoneOff } from 'lucide-react';

const CallControls = ({
    showMenuPopup,
    showSettingsPopup,
    currentSubtitle,
    isConnecting,
    isAiTyping,
    textLanguage,
    IS_OPENAI_REALTIME,
    handleFallbackSubmit,
    fallbackText,
    setFallbackText,
    setShowMenuPopup,
    isCameraOn,
    toggleCamera,
    isListening,
    handleToggleSession,
    startListening,
    setShowCartSummary,
    currentCart,
    setShowSettingsPopup
}) => {
    const [bars, setBars] = useState(Array(32).fill(10));
    useEffect(() => {
        const t = setInterval(() => setBars(b => b.map(() => 8 + Math.random() * 28)), 180);
        return () => clearInterval(t);
    }, []);

    const cartCount = currentCart.reduce((acc, item) => acc + item.qty, 0);

    return (
        <div className={`call-action-deck ${(showMenuPopup || showSettingsPopup) ? 'hidden-deck' : ''}`} style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', padding: '0 16px 20px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 80%, transparent)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 100 }}>
            {/* Edge to Edge Waveform */}
            <div style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px' }}>
                {bars.map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${(isListening || isAiTyping || currentSubtitle) ? h : 4}px`, background: '#00e676', borderRadius: '4px', opacity: (isListening || isAiTyping || currentSubtitle) ? 1 : 0.1, transition: 'all 0.1s ease-in-out' }} />
                ))}
            </div>

            {/* Subtitle Block Overlay */}
            {(currentSubtitle || isConnecting || isAiTyping) && (
                <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 20px', borderRadius: '20px', border: '1px solid rgba(0, 230, 118, 0.3)', color: 'white', fontSize: '14px', maxWidth: '360px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                    {isConnecting ? 'Connecting...' : isAiTyping ? 'Robo is typing...' : currentSubtitle}
                </div>
            )}

            {/* Circular Controls Row removed as requested */}
        </div>
    );
};

export default CallControls;
