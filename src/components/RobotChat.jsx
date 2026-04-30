import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoOff, CheckCircle, X } from 'lucide-react';
import './RobotChat.css';
import { io } from 'socket.io-client';

import { API_URL, IS_OPENAI_REALTIME } from '../config';
import useRealtime from '../hooks/useRealtime';

// Sub-components
import MenuSystem from './MenuSystem';
import CartOverlay from './CartOverlay';
import SettingsModal from './SettingsModal';
import CallControls from './CallControls';

const socket = io(API_URL, { autoConnect: true });

const getDialogs = (restaurantName) => ({
  hi: {
    welcome: `${restaurantName} में आपका स्वागत है। मैं हूँ रोबो, आपका डिजिटल सहायक। आज आपकी सेवा में क्या पेश करूँ?`,
    menu_title: "हमारा प्रीमियम डिजिटल मेनू",
    confirm: (total) => `आपका आर्डर सफलतापूर्वक बुक हो चुका है! कुल ₹${total}। ${restaurantName} चुनने के लिए धन्यवाद!`,
    voice_switched: "मेरी आवाज़ अब हिंदी में है।"
  },
  en: {
    welcome: `Welcome to ${restaurantName}. I am Robo, your neural concierge. How can I elevate your dining experience today?`,
    menu_title: "Our Premium Digital Menu",
    confirm: (total) => `Order successfully synchronized! Total: ₹${total}. Thank you for choosing ${restaurantName}.`,
    voice_switched: "Neural voice switched to English."
  }
});

const RobotChat = ({ tableNumber, restaurantId }) => {
  const [restaurantName, setRestaurantName] = useState(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const dialogs = getDialogs(restaurantName || 'Cyber Chef');
  const [showCartSummary, setShowCartSummary] = useState(false);
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
  const [currentCart, setCurrentCart] = useState([]);
  const [orderConfirmedUI, setOrderConfirmedUI] = useState(false);
  const [expandedCats, setExpandedCats] = useState(new Set());
  const [isAutoListenEnabled, setIsAutoListenEnabled] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [sensitivity, setSensitivity] = useState(0.05); 
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [zoomedImage, setZoomedImage] = useState(null); 
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [orderTracking, setOrderTracking] = useState(null);
  const [userPreferences, setUserPreferences] = useState([]);
  const initializationRef = useRef(false);

  const videoRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const fetchMenu = async () => {
    if (!restaurantId) return;
    try {
      const menuRes = await fetch(`${API_URL}/api/menu?restaurant_id=${restaurantId}`);
      const menuData = await menuRes.json();
      const allItems = menuData.data || [];
      const uniqueCategoryNames = Array.from(new Set(allItems.map(i => i.category || 'Other')));
      const grouped = uniqueCategoryNames.map(catName => ({
        category: catName,
        items: allItems.filter(item => (item.category || 'Other') === catName)
      }));
      grouped.sort((a, b) => a.category.localeCompare(b.category));
      setMenuCategories(grouped.filter(g => g.items.length > 0));
      setExpandedCats(new Set(uniqueCategoryNames));
    } catch (error) { console.error("Menu fetch failed:", error); }
  };

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      if (!restaurantId) return;
      try {
        const res = await fetch(`${API_URL}/api/restaurants`);
        const data = await res.json();
        const mine = (data.data || []).find(r => String(r.id) === String(restaurantId));
        if (mine) setRestaurantName(mine.name);
      } catch (e) { console.error("Rest Info Error:", e); }
    };
    fetchRestaurantInfo();
    fetchMenu();
  }, [restaurantId]);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const speak = (text, lang, callback) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    ut.rate = 0.95;
    ut.onstart = () => setIsRobotSpeaking(true);
    ut.onend = () => {
        setIsRobotSpeaking(false);
        if (callback) callback();
    };
    synthRef.current.speak(ut);
  };

  const getCartTotal = () => currentCart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const getCartCount = () => currentCart.reduce((acc, item) => acc + item.qty, 0);

  const handleManualCartUpdate = (item, delta) => {
    setCurrentCart(prev => {
        const existing = prev.find(i => String(i.id) === String(item.id));
        if (existing) {
            const newQty = existing.qty + delta;
            if (newQty <= 0) return prev.filter(i => String(i.id) !== String(item.id));
            return prev.map(i => String(i.id) === String(item.id) ? { ...existing, qty: newQty } : i);
        }
        if (delta > 0) return [...prev, { ...item, qty: delta }];
        return prev;
    });
  };

  const normalizeName = (value = '') =>
    String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

  const findMenuItemByName = (itemName) => {
    const query = normalizeName(itemName);
    if (!query) return null;
    const allItems = menuCategories.flatMap((cat) => cat.items || []);
    return (
      allItems.find((item) => normalizeName(item.name) === query) ||
      allItems.find((item) => normalizeName(item.name).includes(query) || query.includes(normalizeName(item.name))) ||
      null
    );
  };

  const getItemQty = (itemOrId) => {
    const menuItem = typeof itemOrId === 'object' ? itemOrId : null;
    const targetId = menuItem?.id ?? itemOrId;
    const targetName = normalizeName(menuItem?.name || '');

    const match = currentCart.find((cartItem) => {
      const sameId = targetId !== undefined && targetId !== null && String(cartItem.id) === String(targetId);
      const sameName = targetName && normalizeName(cartItem.name) === targetName;
      return sameId || sameName;
    });

    return Number(match?.qty || 0);
  };

  const completeOrderProcess = async (e) => {
    if (e) e.preventDefault();
    if (getCartCount() === 0) return;
    if (!customerInfo.name || !customerInfo.phone) {
        alert(textLanguage === 'hi' ? 'कृपया अपना नाम और मोबाइल नंबर दर्ज करें।' : 'Please enter your name and phone number.');
        return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
        alert(textLanguage === 'hi' ? 'कृपया एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
        return;
    }
    
    try {
        const orderData = {
            restaurant_id: restaurantId,
            tableNumber,
            items: currentCart,
            total: getCartTotal(),
            timestamp: Date.now(),
            status: 'pending',
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone
        };
        const res = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (res.ok) {
            setOrderConfirmedUI(true);
            setCurrentCart([]);
            setShowCustomerForm(false);
            setCustomerInfo({ name: '', phone: '' });
            speak(dialogs[voiceLanguage].confirm(orderData.total), voiceLanguage);
            setTimeout(() => setOrderConfirmedUI(false), 5000);
            if (IS_OPENAI_REALTIME) stopSession();
        }
    } catch (e) { console.error("Order Failed:", e); }
  };

  const initiateCheckout = () => {
      if (getCartCount() === 0) return;
      setShowCustomerForm(true);
      setShowCartSummary(false); // Hide cart summary if open
  };

  const { 
    isConnecting, 
    handleToggleSession,
    isSessionActive,
    stopSession
  } = useRealtime(restaurantId, tableNumber, {
    onCartUpdate: (items) => {
        const normalizedItems = (items || []).map((item) => {
          const matchedMenuItem = !item?.id ? findMenuItemByName(item?.name) : null;
          return {
            ...item,
            id: item?.id ?? matchedMenuItem?.id,
            name: item?.name ?? matchedMenuItem?.name,
            price: Number(item?.price ?? matchedMenuItem?.price ?? 0),
            qty: Number(item?.qty ?? item?.quantity ?? 1)
          };
        });
        setCurrentCart(normalizedItems);
        if (items.length > 0) setShowMenuPopup(true);
    },
    onShowMenu: (category) => {
        if (category) setActiveCategory(category);
        setShowMenuPopup(true);
    },
    onConfirmOrder: () => initiateCheckout(),
    onRealtimeEvent: (event) => {
        if (event.type === 'response.created') {
            if (!sessionStartTimeRef.current) sessionStartTimeRef.current = Date.now();
            setIsAiProcessing(true);
        }
    },
    onResponse: (text) => {
        setCurrentSubtitle(text);
        setIsRobotSpeaking(true);
        setTimeout(() => setIsRobotSpeaking(false), text.length * 50);
    },
    onProcessingStart: () => setIsAiProcessing(true),
    onProcessingEnd: () => setIsAiProcessing(false),
    onUserTranscript: (text) => {
        window._lastUserTranscript = text;
    },
    onAiTranscript: async (text) => {
        try {
            await fetch(`${API_URL}/api/monitoring/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurant_id: restaurantId,
                    table_number: tableNumber,
                    transcript: window._lastUserTranscript || '',
                    reply: text,
                    action: window._lastToolAction || 'CHAT'
                })
            });
            window._lastToolAction = null;
        } catch (e) { console.error("Logging failed", e); }
    },
    onToolCall: ({ name, args }) => {
        window._lastToolAction = name;
        if (name === 'show_menu') {
            if (args?.category) setActiveCategory(args.category);
            setShowMenuPopup(true);
            return;
        }

        if (name === 'confirm_order') {
            initiateCheckout();
            return;
        }

        if (name === 'show_item_photo') {
            const target = findMenuItemByName(args?.name);
            if (target?.image_url) {
                setCurrentImageUrl(target.image_url);
                setTimeout(() => setCurrentImageUrl(null), 2500);
            }
            return;
        }

        if (name === 'add_item_to_cart') {
            const target = findMenuItemByName(args?.name);
            if (!target) return;
            const quantity = Math.max(1, Number(args?.quantity) || 1);
            setCurrentCart((prev) => {
                const existing = prev.find((i) => String(i.id) === String(target.id));
                if (existing) {
                    return prev.map((i) =>
                        String(i.id) === String(target.id) ? { ...i, qty: (i.qty || 0) + quantity } : i
                    );
                }
                return [...prev, { ...target, qty: quantity }];
            });
            setShowMenuPopup(true);
            return;
        }

        if (name === 'remove_item_from_cart') {
            const target = findMenuItemByName(args?.name);
            if (!target) return;
            const quantity = Math.max(1, Number(args?.quantity) || 1);
            setCurrentCart((prev) =>
                prev
                    .map((i) =>
                        String(i.id) === String(target.id) ? { ...i, qty: Math.max(0, (i.qty || 0) - quantity) } : i
                    )
                    .filter((i) => (i.qty || 0) > 0)
            );
            return;
        }

        if (name === 'update_item_quantity') {
            const target = findMenuItemByName(args?.name);
            if (!target) return;
            const quantity = Math.max(0, Number(args?.quantity));
            setCurrentCart((prev) => {
                const existing = prev.find((i) => String(i.id) === String(target.id));
                if (quantity === 0) {
                    return prev.filter((i) => String(i.id) !== String(target.id));
                }
                if (existing) {
                    return prev.map((i) =>
                        String(i.id) === String(target.id) ? { ...i, qty: quantity } : i
                    );
                }
                return [...prev, { ...target, qty: quantity }];
            });
            setShowMenuPopup(true);
            return;
        }

        if (name === 'apply_coupon') {
            const code = args?.code || 'SAVE20';
            setActiveCoupon({ code, discount: 120 });
            setTimeout(() => setActiveCoupon(null), 5000);
            return;
        }

        if (name === 'track_order') {
            setOrderTracking({ status: 'Chef is preparing', eta: '8 mins' });
            setTimeout(() => setOrderTracking(null), 10000);
            return;
        }

        if (name === 'clear_cart') {
            setCurrentCart([]);
            return;
        }

        if (name === 'repeat_last_order') {
            // Mocking a last order repeat
            const mockItems = menuCategories[0]?.items.slice(0, 2).map(i => ({ ...i, qty: 1 })) || [];
            setCurrentCart(mockItems);
            setShowCartSummary(true);
            return;
        }

        if (name === 'save_user_preference') {
            setUserPreferences(prev => [...prev, args?.preference]);
            return;
        }

        if (name === 'show_best_sellers') {
            setActiveCategory('All');
            setMenuSearchTerm('Best Seller');
            setShowMenuPopup(true);
            return;
        }

        if (name === 'show_offers') {
            setShowSettingsPopup(true);
            return;
        }
    }
  }, currentCart);

  const toggleCategory = (cat) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (stream) stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
        setIsCameraOn(true);
      } catch (e) { setHasCameraError(true); }
    }
  };

  const startListening = () => {
    if (!initializationRef.current) {
        initializationRef.current = true;
        speak(dialogs[voiceLanguage].welcome, voiceLanguage);
        setHasGreeted(true);
    }
    setIsListening(!isListening);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '', name: '', phone: '' });

  const submitFeedback = async () => {
    try {
        await fetch(`${API_URL}/api/mgmt/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                restaurant_id: restaurantId,
                table_number: tableNumber,
                customer_phone: feedback.phone || 'Anonymous',
                customer_name: feedback.name || 'Anonymous',
                rating: feedback.rating,
                comment: feedback.comment
            })
        });
        alert(textLanguage === 'hi' ? 'आपकी प्रतिक्रिया के लिए धन्यवाद!' : 'Thank you for your feedback!');
        setShowFeedbackPopup(false);
        setFeedback({ rating: 5, comment: '', name: '', phone: '' });
    } catch (e) { console.error("Feedback failed:", e); }
  };

  return (
    <div className="avatar-screen animate-fade-in video-call-bg">
      <div className="top-call-gradient"></div>
      <div className="avatar-header">
        <div className="header-badge calling">Table {tableNumber} | Order: ₹{getCartTotal()}</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
                onClick={() => setShowFeedbackPopup(true)}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '12px', color: 'white', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
                <span style={{ color: '#f1c40f' }}>★</span> {textLanguage === 'hi' ? 'फीडबैक' : 'Feedback'}
            </button>
            <div className="call-timer-badge"><div className="live-dot"></div>{formatTime(callDuration)}</div>
        </div>
      </div>

      <div className="avatar-container">
        <div className={`avatar-pulse-ring ${isRobotSpeaking ? 'speaking' : ''} ${isListening ? 'listening-ring' : ''}`}></div>
        <img src="/avatar.png" alt="AI Waiter Avatar" className={`waiter-avatar breathing-idle ${isRobotSpeaking ? 'animate-talk' : ''}`} />
        
        {!hasCameraError && (
          <div className="customer-pip-card" style={{ position: 'absolute', top: '80px', right: '20px', width: '110px', height: '150px', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.2)', zIndex: 30 }}>
            <video ref={videoRef} autoPlay playsInline muted className={`pip-video ${!isCameraOn ? 'muted-video' : ''}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {!isCameraOn && <div className="pip-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><VideoOff size={20} color="white" /></div>}
            
            {/* "You" Tag positioned floating at the bottom right inside the preview box */}
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontSize: '11px', fontWeight: 'bold', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '10px', backdropFilter: 'blur(4px)' }}>
              <span>You</span>
              {(isListening || isSessionActive) && (
                <div className="vocal-wave-container">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
              )}
              {!(isListening || isSessionActive) && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5px', height: '10px' }}>
                  <span style={{ width: '2px', height: '100%', background: '#00e676', borderRadius: '1px' }}></span>
                  <span style={{ width: '2px', height: '50%', background: '#00e676', borderRadius: '1px' }}></span>
                  <span style={{ width: '2px', height: '75%', background: '#00e676', borderRadius: '1px' }}></span>
                </div>
              )}
            </div>
          </div>
        )}

        {orderConfirmedUI && (
          <div className="order-success-overlay scale-in">
            <CheckCircle size={48} color="white" fill="var(--success)" />
            <p>{textLanguage === 'hi' ? 'आर्डर कन्फर्म हो चुका है!' : 'Order Confirmed!'}</p>
          </div>
        )}

        {currentImageUrl && (
          <div className="neural-image-preview scale-in">
            <img src={getMediaUrl(currentImageUrl)} alt="Dish Preview" />
            <div className="neural-scan-line"></div>
          </div>
        )}

        {activeCoupon && (
          <div className="premium-toast coupon-toast slide-up">
            <div className="toast-icon">💸</div>
            <div className="toast-content">
              <strong>{activeCoupon.code} applied!</strong>
              <span>₹{activeCoupon.discount} saved on this order 🎉</span>
            </div>
          </div>
        )}

        {orderTracking && (
          <div className="premium-toast tracking-toast slide-up">
            <div className="toast-icon">👨‍🍳</div>
            <div className="toast-content">
              <strong>{orderTracking.status}</strong>
              <span>ETA: {orderTracking.eta} 🚴</span>
            </div>
          </div>
        )}

        {isAiProcessing && (
          <div className="ai-typing-indicator slide-up">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
      </div>

      {showMenuPopup && (
        <MenuSystem 
          menuCategories={menuCategories}
          textLanguage={textLanguage}
          menuSearchTerm={menuSearchTerm}
          setMenuSearchTerm={setMenuSearchTerm}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          toggleCategory={toggleCategory}
          expandedCats={expandedCats}
          getItemQty={getItemQty}
          handleManualCartUpdate={handleManualCartUpdate}
          getCartTotal={getCartTotal}
          getCartCount={getCartCount}
          setShowCartSummary={setShowCartSummary}
          completeOrderProcess={initiateCheckout}
          setShowMenuPopup={setShowMenuPopup}
          getMediaUrl={getMediaUrl}
          setZoomedImage={setZoomedImage}
        />
      )}

      {showCartSummary && (
        <CartOverlay 
          currentCart={currentCart}
          textLanguage={textLanguage}
          setShowCartSummary={setShowCartSummary}
          getMediaUrl={getMediaUrl}
          setZoomedImage={setZoomedImage}
          handleManualCartUpdate={handleManualCartUpdate}
          getCartTotal={getCartTotal}
          completeOrderProcess={initiateCheckout}
        />
      )}

      {showSettingsPopup && !IS_OPENAI_REALTIME && (
        <SettingsModal 
          textLanguage={textLanguage}
          setShowSettingsPopup={setShowSettingsPopup}
          isAutoListenEnabled={isAutoListenEnabled}
          setIsAutoListenEnabled={setIsAutoListenEnabled}
          sensitivity={sensitivity}
          setSensitivity={setSensitivity}
          voiceLanguage={voiceLanguage}
          setVoiceLanguage={setVoiceLanguage}
          setCurrentSubtitle={setCurrentSubtitle}
          speak={speak}
        />
      )}

      <CallControls 
        showMenuPopup={showMenuPopup}
        showSettingsPopup={showSettingsPopup}
        currentSubtitle={currentSubtitle}
        isConnecting={isConnecting}
        isAiTyping={isAiTyping}
        textLanguage={textLanguage}
        IS_OPENAI_REALTIME={IS_OPENAI_REALTIME}
        handleFallbackSubmit={(e) => { e.preventDefault(); setFallbackText(''); }}
        fallbackText={fallbackText}
        setFallbackText={setFallbackText}
        setShowMenuPopup={setShowMenuPopup}
        isCameraOn={isCameraOn}
        toggleCamera={toggleCamera}
        isListening={isListening || isSessionActive}
        handleToggleSession={handleToggleSession}
        startListening={startListening}
        setShowCartSummary={setShowCartSummary}
        currentCart={currentCart}
        setShowSettingsPopup={setShowSettingsPopup}
      />

      {zoomedImage && (
        <div className="image-zoom-overlay" onClick={() => setZoomedImage(null)}>
            <div className="zoomed-image-container slide-up" onClick={e => e.stopPropagation()}>
                <button className="close-zoom-btn" onClick={() => setZoomedImage(null)}>×</button>
                <img src={zoomedImage} alt="Zoomed dish" />
            </div>
        </div>
      )}

      {showCustomerForm && (
        <div className="modal-overlay" onClick={() => setShowCustomerForm(false)}>
            <div style={{ background: 'rgba(23, 23, 33, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '32px', maxWidth: '440px', width: '100%', backdropFilter: 'blur(16px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                    {textLanguage === 'hi' ? 'बुकिंग डिटेल्स' : 'Booking Details'}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px', lineHeight: '1.5' }}>
                    {textLanguage === 'hi' ? 'आर्डर बुक करने के लिए कृपया अपनी जानकारी दें।' : 'Please provide your details to confirm the order.'}
                </p>
                <form onSubmit={(e) => { e.preventDefault(); completeOrderProcess(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{textLanguage === 'hi' ? 'पूरा नाम' : 'Full Name'}</label>
                        <input 
                            type="text" 
                            required 
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px 16px', borderRadius: '12px', color: '#ffffff', fontSize: '15px', outline: 'none', transition: 'all 0.3s' }}
                            placeholder={textLanguage === 'hi' ? 'अपना नाम लिखें' : 'Enter your name'}
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{textLanguage === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}</label>
                        <input 
                            type="tel" 
                            required 
                            pattern="[0-9]{10}"
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px 16px', borderRadius: '12px', color: '#ffffff', fontSize: '15px', outline: 'none', transition: 'all 0.3s' }}
                            placeholder={textLanguage === 'hi' ? '10 अंकों का नंबर' : '10-digit number'}
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                        <button type="button" style={{ flex: 1, padding: '14px', background: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '30px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => setShowCustomerForm(false)}>
                            {textLanguage === 'hi' ? 'रद्द करें' : 'Cancel'}
                        </button>
                        <button type="submit" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', color: '#ffffff', border: 'none', borderRadius: '30px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.4)', transition: 'all 0.3s' }}>
                            {textLanguage === 'hi' ? 'आर्डर बुक करें' : 'Confirm Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
      {showFeedbackPopup && (
        <div className="modal-overlay" onClick={() => setShowFeedbackPopup(false)}>
            <div style={{ background: 'rgba(23, 23, 33, 0.98)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '32px', padding: '40px', maxWidth: '400px', width: '100%', backdropFilter: 'blur(20px)', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)', position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowFeedbackPopup(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}><X size={24} /></button>
                
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
                    <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>
                        {textLanguage === 'hi' ? 'आपका अनुभव कैसा रहा?' : 'How was your experience?'}
                    </h3>
                    <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)' }}>
                        {textLanguage === 'hi' ? 'आपकी राय हमारे लिए महत्वपूर्ण है।' : 'Your feedback helps us improve.'}
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <button 
                            key={star} 
                            onClick={() => setFeedback({ ...feedback, rating: star })}
                            style={{ background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', filter: feedback.rating >= star ? 'none' : 'grayscale(100%) opacity(0.3)', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            ⭐
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <input 
                        type="text" 
                        placeholder={textLanguage === 'hi' ? 'आपका नाम (वैकल्पिक)' : 'Your Name (Optional)'}
                        value={feedback.name}
                        onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                    <input 
                        type="tel" 
                        placeholder={textLanguage === 'hi' ? 'मोबाइल नंबर (वैकल्पिक)' : 'Phone Number (Optional)'}
                        value={feedback.phone}
                        onChange={(e) => setFeedback({ ...feedback, phone: e.target.value })}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                    <textarea 
                        placeholder={textLanguage === 'hi' ? 'कुछ और कहना चाहेंगे? (वैकल्पिक)' : 'Any other comments? (Optional)'}
                        value={feedback.comment}
                        onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: 'white', fontSize: '14px', minHeight: '80px', outline: 'none', resize: 'none' }}
                    />
                </div>

                <button 
                    onClick={submitFeedback}
                    style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)', color: '#000', border: 'none', borderRadius: '30px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(241, 196, 15, 0.3)' }}
                >
                    {textLanguage === 'hi' ? 'फीडबैक भेजें' : 'Submit Feedback'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default RobotChat;