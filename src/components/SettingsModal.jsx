import React from 'react';

const SettingsModal = ({
    textLanguage,
    setShowSettingsPopup,
    isAutoListenEnabled,
    setIsAutoListenEnabled,
    sensitivity,
    setSensitivity,
    voiceLanguage,
    setVoiceLanguage,
    setCurrentSubtitle,
    speak
}) => {
    return (
        <div className="settings-overlay animate-fade-in">
            <div className="settings-modal scale-in">
                <div className="settings-header">
                    <h4>{textLanguage === 'en' ? 'Settings' : 'सेटिंग्स'}</h4>
                    <button onClick={() => setShowSettingsPopup(false)}>×</button>
                </div>
                <div className="settings-group">
                    <label>{textLanguage === 'en' ? 'Sentient Ear (Auto-Mic)' : 'ऑटो-मिक (सेंटिएंट मोड)'}</label>
                    <div className="toggle-pill">
                        <button
                            className={!isAutoListenEnabled ? 'active' : ''}
                            onClick={() => setIsAutoListenEnabled(false)}>
                            Manual Click
                        </button>
                        <button
                            className={isAutoListenEnabled ? 'active' : ''}
                            onClick={() => setIsAutoListenEnabled(true)}>
                            Hands-Free
                        </button>
                    </div>
                    <p className="settings-desc">
                        {textLanguage === 'en'
                            ? "AI will automatically start listening when you speak."
                            : "जब आप बोलेंगे, रोबो अपने आप सुनना शुरू कर देगा।"}
                    </p>
                </div>
                {isAutoListenEnabled && (
                    <div className="settings-group">
                        <label>{textLanguage === 'en' ? 'Ear Sensitivity' : 'माइक सेंसिटिविटी'}</label>
                        <input
                            type="range"
                            min="0.01"
                            max="0.2"
                            step="0.01"
                            value={sensitivity}
                            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                            className="sensitivity-slider"
                        />
                        <div className="slider-labels">
                            <span>Quiet</span>
                            <span>Loud</span>
                        </div>
                    </div>
                )}
                <div className="settings-group">
                    <label>{textLanguage === 'en' ? 'Neural Assistant Voice' : 'रोबो की आवाज़'}</label>
                    <div className="toggle-pill">
                        <button
                            className={voiceLanguage === 'en' ? 'active' : ''}
                            onClick={() => {
                                setVoiceLanguage('en');
                                setCurrentSubtitle("Neural voice specialized to English.");
                                speak("Neural voice specialized to English.", 'en');
                            }}>
                            Pure English
                        </button>
                        <button
                            className={voiceLanguage === 'hi' ? 'active' : ''}
                            onClick={() => {
                                setVoiceLanguage('hi');
                                setCurrentSubtitle("Neural voice localized to Hinglish.");
                                speak("अब मैं आपसे हिंदी और इंग्लिश दोनों में बात करूँगा।", 'hi');
                            }}>
                            Human Hinglish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
