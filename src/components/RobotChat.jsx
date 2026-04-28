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
    onResponse: (text) => {
        setCurrentSubtitle(text);
        setIsRobotSpeaking(true);
        setTimeout(() => setIsRobotSpeaking(false), text.length * 50);
    },
    onToolCall: ({ name, args }) => {
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
        }
    }
  });

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

        {currentImageUrl && (
          <div className="neural-image-preview scale-in">
            <img src={getMediaUrl(currentImageUrl)} alt="Dish Preview" />
            <div className="neural-scan-line"></div>
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
            <div className="modal-content glass-panel animate-scale-in booking-modal" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 view-title">
                    {textLanguage === 'hi' ? 'बुकिंग डिटेल्स' : 'Booking Details'}
                </h3>
                <p className="text-muted mb-6">
                    {textLanguage === 'hi' ? 'आर्डर बुक करने के लिए कृपया अपनी जानकारी दें।' : 'Please provide your details to confirm the order.'}
                </p>
                <form onSubmit={(e) => { e.preventDefault(); completeOrderProcess(); }} className="modern-form booking-form">
                    <div className="form-group mb-4">
                        <label>{textLanguage === 'hi' ? 'पूरा नाम' : 'Full Name'}</label>
                        <input 
                            type="text" 
                            required 
                            placeholder={textLanguage === 'hi' ? 'अपना नाम लिखें' : 'Enter your name'}
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        />
                    </div>
                    <div className="form-group mb-6">
                        <label>{textLanguage === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}</label>
                        <input 
                            type="tel" 
                            required 
                            pattern="[0-9]{10}"
                            placeholder={textLanguage === 'hi' ? '10 अंकों का नंबर' : '10-digit number'}
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        />
                    </div>
                    <div className="flex gap-4">
                        <button type="button" className="btn-secondary w-full" onClick={() => setShowCustomerForm(false)}>
                            {textLanguage === 'hi' ? 'रद्द करें' : 'Cancel'}
                        </button>
                        <button type="submit" className="btn-primary w-full">
                            {textLanguage === 'hi' ? 'आर्डर बुक करें' : 'Confirm Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default RobotChat;