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

            {/* Circular Controls Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '400px' }}>
                {/* Menu */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => setShowMenuPopup(true)} style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <MenuIcon size={24} />
                    </button>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Menu</span>
                </div>

                {/* Camera */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <button onClick={toggleCamera} style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Camera</span>
                </div>

                {/* Listening (Large Central Button) */}
                <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <button 
                        onClick={IS_OPENAI_REALTIME ? handleToggleSession : startListening}
                        disabled={isConnecting}
                        style={{ 
                            width: '76px', 
                            height: '76px', 
                            borderRadius: '50%', 
                            background: (isListening) ? '#00e676' : 'rgba(255,255,255,0.15)', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            boxShadow: (isListening) ? '0 0 30px rgba(0, 230, 118, 0.6)' : 'none',
                        }}
                    >
                        {isConnecting ? <div className="hud-loader"></div> : <Mic size={32} />}
                    </button>
                    <span style={{ fontSize: '11px', color: '#00e676', fontWeight: '600' }}>{isListening ? 'Listening...' : 'Speak'}</span>
                </div>

                {/* Cart */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => setShowCartSummary(true)} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <ShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ff4757', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid black' }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Cart</span>
                </div>

                {/* End Call */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => window.location.reload()} style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ff4757', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <PhoneOff size={24} />
                    </button>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>End</span>
                </div>
            </div>
        </div>
    );
};

export default CallControls;
