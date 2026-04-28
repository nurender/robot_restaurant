import React from 'react';
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
    return (
        <div className={`call-action-deck ${(showMenuPopup || showSettingsPopup) ? 'hidden-deck' : ''}`}>
            {(currentSubtitle != '' || isConnecting) && (
                <div className="subtitle-area">
                    {isConnecting ? (
                        <span className="subtitle-text animate-pulse">Neural Handshake...</span>
                    ) : isAiTyping ? (
                        <span className="subtitle-text animate-pulse italic">
                            {textLanguage === 'hi' ? 'रोबो टाइप kar raha hai...' : 'Robo is typing...'}
                        </span>
                    ) : (
                        <span className="subtitle-text">{currentSubtitle}</span>
                    )}
                </div>
            )}
            {!IS_OPENAI_REALTIME && (
                <form className="fallback-form" onSubmit={handleFallbackSubmit}>
                    <input
                        type="text"
                        placeholder={textLanguage === 'hi' ? "यहाँ टाइप करें..." : "Type here..."}
                        value={fallbackText}
                        onChange={(e) => setFallbackText(e.target.value)}
                    />
                    <button type="submit" disabled={!fallbackText.trim()}>Send</button>
                </form>
            )}
            <div className="call-buttons-row">
                <button className="call-btn secondary-btn" onClick={() => setShowMenuPopup(true)} title="Menu"><MenuIcon size={24} /></button>
                <button className={`call-btn secondary-btn ${!isCameraOn ? 'muted' : ''}`} onClick={toggleCamera} title="Camera">
                    {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>

                <button
                    className={`call-btn active-call-btn ${isListening ? 'listening' : ''} ${isConnecting ? 'connecting' : ''}`}
                    onClick={IS_OPENAI_REALTIME ? handleToggleSession : startListening}
                    title="Speak"
                    disabled={isConnecting}
                >
                    {isConnecting ? <div className="hud-loader"></div> : isListening ? <Mic size={28} /> : <MicOff size={28} />}
                </button>

                <button className="call-btn secondary-btn cart-btn-deck" onClick={() => setShowCartSummary(true)} title="Cart" style={{ position: 'relative' }}>
                    <ShoppingCart size={24} />
                    {currentCart.reduce((acc, item) => acc + item.qty, 0) > 0 && (
                        <span className="deck-cart-badge">
                            {currentCart.reduce((acc, item) => acc + item.qty, 0)}
                        </span>
                    )}
                </button>

                {!IS_OPENAI_REALTIME && (
                    <button className="call-btn secondary-btn" onClick={() => setShowSettingsPopup(true)} title="Settings"><Settings size={22} /></button>
                )}
                {/* <button className="call-btn danger-btn end-call-btn" onClick={() => window.location.reload()}><PhoneOff size={28} /></button> */}
            </div>
        </div>
    );
};

export default CallControls;
