import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Menu as MenuIcon, ChevronRight, ChevronDown, Video, VideoOff, Settings, Plus, Minus, ShoppingCart, CheckCircle } from 'lucide-react';
import './RobotChat.css';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';
const socket = io(API_URL, { autoConnect: true });

const DIALOGS = {
  hi: {
    welcome: "नमस्ते! मैं आपका AI वेटर हूँ। आज आप क्या खाना पसंद करेंगे?",
    menu_title: "हमारा प्रीमियम मेनू",
    confirm: (total) => `आपका आर्डर बुक हो चुका है! कुल ₹${total}। धन्यवाद!`,
    voice_switched: "मेरी आवाज़ अब हिंदी में है।"
  },
  en: {
    welcome: "Hello! I am your AI waiter. What would you like to order today?",
    menu_title: "Our Premium Menu",
    confirm: (total) => `Your order is booked! A total of ₹${total}। Thank you!`,
    voice_switched: "My voice is now set to English."
  }
};

const RobotChat = ({ tableNumber, restaurantId }) => {
  const [textLanguage, setTextLanguage] = useState('en');
  const [voiceLanguage, setVoiceLanguage] = useState('hi');
  const [menuCategories, setMenuCategories] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [fallbackText, setFallbackText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRobotSpeaking, setIsRobotSpeaking] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [hasCameraError, setHasCameraError] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentCart, setCurrentCart] = useState([]);
  const [orderConfirmedUI, setOrderConfirmedUI] = useState(false);
  const [expandedCats, setExpandedCats] = useState(new Set());

  const videoRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  const fetchMenu = async () => {
    try {
      const menuRes = await fetch(`${API_URL}/api/menu?restaurant_id=${restaurantId}`);
      const menuData = await menuRes.json();

      const catRes = await fetch(`${API_URL}/api/categories?restaurant_id=${restaurantId}`);
      const catData = await catRes.json();

      const grouped = catData.data.map(cat => ({
        category: cat.name,
        items: menuData.data.filter(item => item.category === cat.name)
      }));

      setMenuCategories(grouped.filter(g => g.items.length > 0));
      // Expand all by default on first fetch
      setExpandedCats(new Set(grouped.map(g => g.category)));
    } catch (error) {
      console.error("Menu fetch failed:", error);
    }
  };

  useEffect(() => {
    fetchMenu();
    socket.on('menu_updated', () => fetchMenu());
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onspeechend = () => rec.stop();
      recognitionRef.current = rec;
    }
    return () => socket.off('menu_updated');
  }, []);

  useEffect(() => {
    async function setupCamera() {
      try {
        const str = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = str;
        setStream(str);
        setHasCameraError(false);
      } catch (err) {
        setHasCameraError(true);
        setIsCameraOn(false);
      }
    }
    setupCamera();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCurrentSubtitle(DIALOGS[textLanguage].welcome);
    speak(DIALOGS[voiceLanguage].welcome, voiceLanguage);
    return () => synthRef.current?.cancel();
  }, []);

  const speak = (text, langToSpeak = voiceLanguage) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      let selectedVoice = (langToSpeak === 'hi')
        ? voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'))
        : voices.find(v => v.lang.includes('en') || v.lang.includes('US'));

      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onstart = () => setIsRobotSpeaking(true);
      utterance.onend = () => setIsRobotSpeaking(false);
      utterance.onerror = () => setIsRobotSpeaking(false);
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || isListening) return;
    try {
      synthRef.current?.cancel();
      setIsRobotSpeaking(false);
      setCurrentSubtitle(textLanguage === 'hi' ? "सुन रहा हूँ..." : "Listening...");
      recognition.lang = voiceLanguage === 'hi' ? 'hi-IN' : 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("🎤 Voice Detected:", transcript);
        processMockAIResponse(transcript);
      };
      recognition.onerror = (e) => {
        console.error("🎤 Mic Error:", e.error);
        setIsListening(false);
      };
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const processMockAIResponse = async (userText) => {
    setIsAiTyping(true);
    setCurrentSubtitle(`${textLanguage === 'hi' ? 'आप' : 'You'}: "${userText}"`);

    // Update local history immediately
    const updatedHistory = [...chatHistory, { role: 'user', text: userText }];
    setChatHistory(updatedHistory);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: userText,
          menuContext: menuCategories,
          cartContext: currentCart,
          textLanguage: textLanguage,
          chatHistory: updatedHistory
        })
      });
      const data = await response.json();
      setIsAiTyping(false);

      // Update history with robot reply
      setChatHistory(prev => [...prev, { role: 'robot', text: data.reply_text }]);

      if (data.items_to_add && data.items_to_add.length > 0) {
        setCurrentCart(prevCart => {
          const newCart = [...prevCart];
          data.items_to_add.forEach(itm => {
            const itmId = itm.id?.toString();
            if (!itmId) return;

            // Lookup full item details from menuCategories to prevent NaN
            let foundItem = null;
            for (const cat of menuCategories) {
              const match = cat.items.find(i => i.id.toString() === itmId);
              if (match) { foundItem = match; break; }
            }

            const existingIdx = newCart.findIndex(i => i.id.toString() === itmId);
            if (existingIdx > -1) {
              const updatedItem = { ...newCart[existingIdx], qty: newCart[existingIdx].qty + itm.qty };
              if (updatedItem.qty <= 0) newCart.splice(existingIdx, 1);
              else newCart[existingIdx] = updatedItem;
            } else if (itm.qty > 0 && foundItem) {
              newCart.push({ ...foundItem, qty: itm.qty });
            }
          });
          return newCart;
        });
      }

      setIsRobotSpeaking(true);
      setCurrentSubtitle(`Robo: ${data.reply_text}`);
      speak(data.reply_text, voiceLanguage);
      setTimeout(() => setIsRobotSpeaking(false), 3000);

      if (data.action === 'EXPAND_CATEGORY' && data.category) {
        setShowMenuPopup(true);
        setExpandedCats(prev => new Set(prev).add(data.category));
      }

      if (data.action === 'PLACE_ORDER') {
        setTimeout(() => completeOrderProcess(), 1000);
      }

      if (userText.toLowerCase().includes('menu') || userText.includes('मेनू')) setShowMenuPopup(true);
    } catch (err) {
      setIsAiTyping(false);
      console.error("AI Response Error:", err);
    }
  };

  const handleManualCartUpdate = (item, delta) => {
    setCurrentCart(prevCart => {
      const newCart = [...prevCart];
      const existingIdx = newCart.findIndex(i => Number(i.id) === Number(item.id));
      if (existingIdx > -1) {
        const updatedItem = { ...newCart[existingIdx], qty: newCart[existingIdx].qty + delta };
        if (updatedItem.qty <= 0) newCart.splice(existingIdx, 1);
        else newCart[existingIdx] = updatedItem;
      } else if (delta > 0) {
        newCart.push({ ...item, qty: delta });
      }
      return newCart;
    });
  };

  const getItemQty = (id) => {
    if (!id) return 0;
    const itm = currentCart.find(i => Number(i.id) === Number(id));
    return itm ? itm.qty : 0;
  };

  const getCartTotal = () => currentCart.reduce((sum, item) => sum + ((Number(item.price) || 0) * item.qty), 0);
  const getCartCount = () => currentCart.reduce((sum, item) => sum + item.qty, 0);

  const handleFallbackSubmit = (e) => {
    e.preventDefault();
    if (fallbackText.trim()) {
      processMockAIResponse(fallbackText);
      setFallbackText('');
    }
  };

  const completeOrderProcess = async () => {
    if (currentCart.length === 0) return;
    const total = getCartTotal();
    const newOrder = {
      restaurant_id: Number(restaurantId),
      tableNumber: tableNumber,
      items: currentCart,
      total: total,
      timestamp: Date.now(),
      status: 'pending'
    };
    try {
      await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      setCurrentCart([]);
      setShowMenuPopup(false);
      setOrderConfirmedUI(true);
      const msg = DIALOGS[textLanguage].confirm(total);
      setCurrentSubtitle(msg);
      speak(DIALOGS[voiceLanguage].confirm(total), voiceLanguage);
      setTimeout(() => setOrderConfirmedUI(false), 3000);
    } catch (err) { console.error(err); }
  };

  const toggleCategory = (catName) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catName)) next.delete(catName);
      else next.add(catName);
      return next;
    });
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="avatar-screen animate-fade-in video-call-bg">
      <div className="top-call-gradient"></div>
      <div className="avatar-header">
        <div className="header-badge calling">Table {tableNumber} | Order: ₹{getCartTotal()}</div>
        <div className="call-timer-badge"><div className="live-dot"></div>{formatTime(callDuration)}</div>
      </div>
      <div className="avatar-container">
        <div className={`avatar-pulse-ring ${isRobotSpeaking ? 'speaking' : ''} ${isListening ? 'listening-ring' : ''}`}></div>
        <img src="/avatar.png" alt="AI Waiter Avatar" className={`waiter-avatar breathing-idle ${isRobotSpeaking ? 'animate-talk' : ''}`} />
        {!hasCameraError && (
          <div className="user-camera-pip">
            <video ref={videoRef} autoPlay playsInline muted className={`pip-video ${!isCameraOn ? 'muted-video' : ''}`} />
            {!isCameraOn && <div className="pip-overlay"><VideoOff size={24} color="white" /></div>}
          </div>
        )}
        {orderConfirmedUI && (
          <div className="order-success-overlay scale-in">
            <CheckCircle size={48} color="white" fill="var(--success)" />
            <p>{textLanguage === 'hi' ? 'आर्डर कन्फर्म हो चुका है!' : 'Order Confirmed!'}</p>
          </div>
        )}
      </div>

      {showMenuPopup && (
        <div className="premium-menu-panel slide-up">
          <div className="menu-header">
            <div>
              <h4>{textLanguage === 'en' ? 'Our Menu' : 'हमारा मेनू'}</h4>
              <span className="menu-subtitle">{textLanguage === 'en' ? 'Select your favorite dishes' : 'अपनी पसंदीदा डिश चुनें'}</span>
            </div>
            <button onClick={() => setShowMenuPopup(false)}>×</button>
          </div>
          <div className="menu-content scrollbar-hidden">
            {menuCategories.map((category, catIdx) => {
              const isExpanded = expandedCats.has(category.category);
              return (
                <div key={catIdx} className={`menu-category ${isExpanded ? 'expanded' : 'collapsed'}`}>
                  <div className="category-header-row" onClick={() => toggleCategory(category.category)}>
                    <h5 className="category-title">{category.category}</h5>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>

                  {isExpanded && (
                    <div className="category-items animate-fade-in">
                      {category.items.map((item) => {
                        const qty = getItemQty(item.id);
                        return (
                          <div key={item.id} className="premium-menu-item animate-slide-up">
                            <div className="item-media">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="item-thumb" />
                              ) : (
                                <div className="item-thumb-placeholder"><ChefHat size={24} /></div>
                              )}
                              {item.video_url && <div className="video-dot-indicator"><Play size={8} fill="white" /></div>}
                            </div>

                            <div className="item-details">
                              <div className="item-header">
                                <h6 className="item-name">{item.name}</h6>
                                <span className="item-price">₹{item.price}</span>
                              </div>
                              <p className="item-description">{item.description || item.desc || "Delicately crafted for your tech palate."}</p>
                              <div className="item-actions-row">
                                {qty === 0 ? (
                                  <button className="add-btn-primary" onClick={() => handleManualCartUpdate(item, 1)}>
                                    <Plus size={14} /> ADD
                                  </button>
                                ) : (
                                  <div className="qty-controls-premium">
                                    <button onClick={() => handleManualCartUpdate(item, -1)}><Minus size={14} /></button>
                                    <span className="qty-val">{qty}</span>
                                    <button onClick={() => handleManualCartUpdate(item, 1)}><Plus size={14} /></button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {getCartCount() > 0 && (
            <div className="menu-cart-footer slide-up">
              <div className="cart-total"><ShoppingCart size={20} /><span>₹{getCartTotal()}</span></div>
              <button className="checkout-btn" onClick={() => completeOrderProcess()}>
                {textLanguage === 'hi' ? 'आर्डर बुक करें' : 'Confirm Order'} <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}


      {showSettingsPopup && (
        <div className="settings-overlay animate-fade-in">
          <div className="settings-modal scale-in">
            <div className="settings-header">
              <h4>{textLanguage === 'en' ? 'Settings' : 'सेटिंग्स'}</h4>
              <button onClick={() => setShowSettingsPopup(false)}>×</button>
            </div>
            <div className="settings-group">
              <label>{textLanguage === 'en' ? 'Subtitle Language' : 'लिखने की भाषा (Text)'}</label>
              <div className="toggle-pill">
                <button className={textLanguage === 'en' ? 'active' : ''} onClick={() => setTextLanguage('en')}>English</button>
                <button className={textLanguage === 'hi' ? 'active' : ''} onClick={() => setTextLanguage('hi')}>हिंदी</button>
              </div>
            </div>
            <div className="settings-group">
              <label>{textLanguage === 'en' ? 'Assistant Voice Language' : 'बोलने की भाषा (Voice)'}</label>
              <div className="toggle-pill">
                <button className={voiceLanguage === 'en' ? 'active' : ''} onClick={() => { setVoiceLanguage('en'); setCurrentSubtitle("Voice mode set to English."); speak("English mode active.", 'en'); }}>English</button>
                <button className={voiceLanguage === 'hi' ? 'active' : ''} onClick={() => { setVoiceLanguage('hi'); setCurrentSubtitle("आवाज़ हिंदी में है।"); speak("अब मैं हिंदी में बोलूंगा।", 'hi'); }}>हिंदी</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`call-action-deck ${(showMenuPopup || showSettingsPopup) ? 'hidden-deck' : ''}`}>
        <div className="subtitle-area">
          {isAiTyping ? (
            <span className="subtitle-text animate-pulse italic">
              {textLanguage === 'hi' ? 'रोबो टाइप कर रहा है...' : 'Robo is typing...'}
            </span>
          ) : (
            <span className="subtitle-text">{currentSubtitle}</span>
          )}
        </div>
        <form className="fallback-form" onSubmit={handleFallbackSubmit}>
          <input type="text" placeholder={textLanguage === 'hi' ? "यहाँ टाइप करें..." : "Type here..."} value={fallbackText} onChange={(e) => setFallbackText(e.target.value)} />
          <button type="submit" disabled={!fallbackText.trim()}>Send</button>
        </form>
        <div className="call-buttons-row">
          <button className="call-btn secondary-btn" onClick={() => setShowMenuPopup(true)} title="Menu"><MenuIcon size={24} /></button>
          <button className={`call-btn active-call-btn ${isListening ? 'listening' : ''}`} onClick={startListening} title="Speak">{isListening ? <Mic size={28} /> : <MicOff size={28} />}</button>
          <button className="call-btn secondary-btn" onClick={() => setShowSettingsPopup(true)} title="Settings"><Settings size={22} /></button>
          <button className="call-btn danger-btn end-call-btn" onClick={() => window.location.reload()}><PhoneOff size={28} /></button>
        </div>
      </div>
    </div>
  );
};

export default RobotChat;