import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, X, Clock, ChefHat, Store, ListTodo, Mic, LogOut, UserCircle, CheckCheck } from 'lucide-react';
import './RobotChat.css';
import { io } from 'socket.io-client';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../firebase';
import { API_URL } from '../config';

// Sub-components
import MenuSystem from './MenuSystem';
import CartOverlay from './CartOverlay';
import ThemeToggle from './ThemeToggle';

const socket = io(API_URL, { autoConnect: true });

const RobotChat = ({ tableNumber, restaurantId }) => {
  const [restaurantData, setRestaurantData] = useState(null);
  const [restaurantName, setRestaurantName] = useState(null);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(() => !!localStorage.getItem('customerPhone'));

  const [showCartSummary, setShowCartSummary] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);

  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [menuCategories, setMenuCategories] = useState([]);
  const [currentCart, setCurrentCart] = useState([]);
  const [orderConfirmedUI, setOrderConfirmedUI] = useState(false);
  const [expandedCats, setExpandedCats] = useState(new Set());
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: localStorage.getItem('customerName') || '',
    phone: localStorage.getItem('customerPhone') || ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderTracking, setOrderTracking] = useState(null);
  const [mockOtpToast, setMockOtpToast] = useState(null);
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const initialFetchDone = useRef(false);

  const [customerSeat, setCustomerSeat] = useState('');
  const [showSeatSelection, setShowSeatSelection] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [voiceInputString, setVoiceInputString] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const parseVoiceCommand = (transcript) => {
    const raw = String(transcript).toLowerCase();
    const words = raw.split(' ');
    const isRemove = raw.includes('remove') || raw.includes('delete') || raw.includes('cancel') || raw.includes('drop');

    let multiplierStr = words.find(w => !isNaN(parseInt(w)) && parseInt(w) > 0);
    let multiplier = multiplierStr ? parseInt(multiplierStr) : 1;
    if (raw.includes('two') || raw.includes('couple')) multiplier = 2;
    if (raw.includes('three')) multiplier = 3;
    if (raw.includes('four')) multiplier = 4;

    let matchedItem = null;
    let matchedVariant = null;

    const allItems = menuCategories.flatMap(c => c.items);
    for (let item of allItems) {
      if (raw.includes(item.name.toLowerCase())) {
        matchedItem = item;
        break;
      }
    }

    if (matchedItem) {
      const opts = matchedItem.options || [];
      const decodedOpts = typeof opts === 'string' ? JSON.parse(opts) : opts;
      if (decodedOpts.length > 0) {
        matchedVariant = decodedOpts.find(o => raw.includes(o.size.toLowerCase())) || decodedOpts[0];
      }

      const delta = isRemove ? -multiplier : multiplier;
      handleManualCartUpdate(matchedItem, delta, matchedVariant, []);

      setVoiceInputString(`Recognized: ${delta > 0 ? '+' : ''}${delta} ${matchedItem.name} ${matchedVariant ? '(' + matchedVariant.size + ')' : ''}`);
      setTimeout(() => setVoiceInputString(''), 4000);
    } else {
      setVoiceInputString(`Didn't catch that. Say e.g. "Add 2 Premium Thali"`);
      setTimeout(() => setVoiceInputString(''), 4000);
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice ordering is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceInputString(`You said: "${transcript}"`);
      parseVoiceCommand(transcript);
    };
    recognition.onerror = (e) => {
      setIsListening(false);
      setVoiceInputString("Microphone error.");
      setTimeout(() => setVoiceInputString(''), 2000);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  useEffect(() => {
    const initApp = async () => {
      setIsGlobalLoading(true);
      if (!restaurantId) {
        setIsGlobalLoading(false);
        return;
      }
      try {
        // Fetch Restaurant Info
        const restRes = await fetch(`${API_URL}/api/restaurants`);
        const restData = await restRes.json();
        const mine = (restData.data || []).find(r => String(r.id) === String(restaurantId));
        if (mine) {
          setRestaurantName(mine.name);
          setRestaurantData(mine);
        }

        await fetchMenuData();

        // Fetch Table Occupancy dynamically
        if (tableNumber) {
          const occupancyRes = await fetch(`${API_URL}/api/orders/track/${tableNumber}?restaurant_id=${restaurantId}`);
          const occupancyData = await occupancyRes.json();
          const hasActiveOrders = occupancyData.orders && occupancyData.orders.length > 0;
          const isLogged = !!localStorage.getItem('customerPhone');
          if (hasActiveOrders && !isLogged) {
            setShowSeatSelection(true);
          }
        }

      } catch (e) {
        console.error("Initialization Error:", e);
      } finally {
        setIsGlobalLoading(false);
      }
    };
    initApp();
  }, [restaurantId]);

  const fetchMenuData = async () => {
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

      const cpRes = await fetch(`${API_URL}/api/mgmt/coupons?restaurant_id=${restaurantId}`);
      if (cpRes.ok) {
        const cpData = await cpRes.json();
        if (cpData.data) {
          setAvailableCoupons(cpData.data.filter(c => c.is_active));
        }
      }
    } catch (e) {
      console.error("Menu Fetch Error:", e);
    }
  };



  const fetchTrackingStatus = useCallback(async () => {
    try {
      const userPhone = localStorage.getItem('customerPhone') || '';
      if (!userPhone) {
        setActiveOrders([]);
        return;
      }

      let url = `${API_URL}/api/orders/track/${tableNumber}?restaurant_id=${restaurantId}`;
      if (userPhone) {
        url += `&phone=${encodeURIComponent(userPhone)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.orders && data.orders.length > 0) {
        setActiveOrders(data.orders);
        // If any order just became ready, maybe show tracking popup automatically
        const anyReady = data.orders.some(o => o.status === 'ready' || o.status === 'out_for_delivery');
        const prevAnyReady = activeOrders.some(o => o.status === 'ready' || o.status === 'out_for_delivery');
        const wasPreviouslyEmpty = activeOrders.length === 0;

        if (!wasPreviouslyEmpty && anyReady && !prevAnyReady) {
          setShowOrderTracking(true);
        }
      } else {
        setActiveOrders([]);
        setShowOrderTracking(false);
      }
      initialFetchDone.current = true;
    } catch (e) { console.error("Tracking fetch failed", e); }
  }, [tableNumber, restaurantId, activeOrders]);

  useEffect(() => {
    fetchTrackingStatus();
  }, [tableNumber, restaurantId]);

  useEffect(() => {
    if (!tableNumber || !restaurantId) return;

    const handleOrderUpdate = (updatedOrder) => {
      console.log("📥 Received socket update:", updatedOrder);
      const isMyTable = String(updatedOrder.tableNumber) === String(tableNumber);
      const isMyRest = String(updatedOrder.restaurant_id) === String(restaurantId);
      const myPhone = localStorage.getItem('customerPhone') || '';
      const isMyOrder = String(updatedOrder.customerPhone) === String(myPhone);

      if (isMyRest && isMyOrder) {
        setActiveOrders(prev => {
          if (updatedOrder.status === 'cancelled') {
            return prev.filter(o => o.id !== updatedOrder.id);
          }
          const exists = prev.find(o => o.id === updatedOrder.id);
          const wasReady = exists && (exists.status === 'ready' || exists.status === 'out_for_delivery');

          if (!wasReady && (updatedOrder.status === 'ready' || updatedOrder.status === 'out_for_delivery')) {
            // Execute safely after state update
            setTimeout(() => setShowOrderTracking(true), 100);
          }

          if (exists) {
            return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
          } else {
            return [updatedOrder, ...prev];
          }
        });
      }
    };

    socket.on('order_updated', handleOrderUpdate);
    socket.on('menu_updated', fetchMenuData);
    socket.on('categories_updated', fetchMenuData);

    return () => {
      socket.off('order_updated', handleOrderUpdate);
      socket.off('menu_updated', fetchMenuData);
      socket.off('categories_updated', fetchMenuData);
    };
  }, [tableNumber, restaurantId]);

  const getCartSubtotal = () => currentCart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const getDiscountAmount = () => {
    if (!activeCoupon) return 0;
    const subtotal = getCartSubtotal();
    if (activeCoupon.min_order_value && subtotal < activeCoupon.min_order_value) return 0;

    // Calculate eligible subtotal by summing items that don't have allow_coupons === false
    const eligibleSubtotal = currentCart.reduce((acc, item) => {
      // If item explicitly disallows coupons, or if it already has an item-level discount and allow_coupons isn't true... wait, the logic is:
      // apply IF allow_coupons !== false.
      if (item.allow_coupons === false) return acc;
      return acc + (item.price * item.qty);
    }, 0);

    if (eligibleSubtotal === 0) return 0; // No items eligible

    let discount = 0;
    if (activeCoupon.discount_type === 'flat') {
      discount = Number(activeCoupon.discount_value);
    } else {
      discount = eligibleSubtotal * (Number(activeCoupon.discount_value) / 100);
    }
    return Math.min(discount, eligibleSubtotal);
  };

  const getCartTax = () => {
    const discountedSubtotal = Math.max(0, getCartSubtotal() - getDiscountAmount());
    const cgstRate = Number(restaurantData?.cgst || 0) / 100;
    const sgstRate = Number(restaurantData?.sgst || 0) / 100;
    return {
      cgst: discountedSubtotal * cgstRate,
      sgst: discountedSubtotal * sgstRate
    };
  };

  const getCartTotal = () => {
    const discountedSubtotal = Math.max(0, getCartSubtotal() - getDiscountAmount());
    const { cgst, sgst } = getCartTax();
    let total = discountedSubtotal + cgst + sgst;

    if (restaurantData?.is_round_off) {
      return Math.floor(total);
    }
    return Number(total.toFixed(2));
  };
  const getCartCount = () => currentCart.reduce((acc, item) => acc + item.qty, 0);

  const handleManualCartUpdate = (item, delta, variant = null, addons = []) => {
    setCurrentCart(prev => {
      // Sort addons conceptually by name to ensure consistent cart ID matching
      const sortedAddons = [...addons].sort((a, b) => a.name.localeCompare(b.name));
      const addonsStr = sortedAddons.length > 0 ? `+${sortedAddons.map(a => a.name).join('+')}` : '';
      const cartItemId = variant ? `${item.id}-${variant.size}${addonsStr}` : `${item.id}${addonsStr}`;

      const existing = prev.find(i => (i.cartId || String(i.id)) === cartItemId);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter(i => (i.cartId || String(i.id)) !== cartItemId);
        return prev.map(i => (i.cartId || String(i.id)) === cartItemId ? { ...existing, qty: newQty } : i);
      }
      if (delta > 0) {
        const addonsPrice = sortedAddons.reduce((acc, a) => acc + Number(a.price || 0), 0);

        let baseVariantPrice = Number(variant ? variant.price : item.price);
        let discountedPrice = baseVariantPrice;

        if (item.discount_type === 'percent' && item.discount_value > 0) {
          discountedPrice = baseVariantPrice - (baseVariantPrice * (item.discount_value / 100));
        } else if (item.discount_type === 'flat' && item.discount_value > 0) {
          discountedPrice = baseVariantPrice - item.discount_value;
        }
        if (discountedPrice < 0) discountedPrice = 0;

        return [...prev, { ...item, cartId: cartItemId, qty: delta, selectedVariant: variant, selectedAddons: sortedAddons, price: Math.round(discountedPrice) + addonsPrice }];
      }
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

  const getItemQty = (itemOrId, variant = null, addons = []) => {
    const menuItem = typeof itemOrId === 'object' ? itemOrId : null;
    const targetId = menuItem?.id ?? itemOrId;

    if (variant || addons.length > 0) {
      const sortedAddons = [...addons].sort((a, b) => a.name.localeCompare(b.name));
      const addonsStr = sortedAddons.length > 0 ? `+${sortedAddons.map(a => a.name).join('+')}` : '';
      const cartItemId = variant ? `${targetId}-${variant.size}${addonsStr}` : `${targetId}${addonsStr}`;

      const match = currentCart.find(c => c.cartId === cartItemId);
      return Number(match?.qty || 0);
    }

    const targetName = normalizeName(menuItem?.name || '');
    let totalQty = 0;
    currentCart.forEach((cartItem) => {
      const sameId = targetId !== undefined && targetId !== null && String(cartItem.id) === String(targetId);
      const sameName = targetName && normalizeName(cartItem.name) === targetName;
      if (sameId || sameName) {
        totalQty += Number(cartItem.qty || 0);
      }
    });

    return totalQty;
  };

  const completeOrderProcess = async (e) => {
    if (e) e.preventDefault();
    if (getCartCount() === 0) return;
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Please enter your name and phone number.');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (isSubmittingOrder) return;
    setIsSubmittingOrder(true);

    try {
      const orderData = {
        restaurant_id: restaurantId,
        tableNumber,
        items: currentCart,
        total: getCartTotal(),
        status: 'pending',
        customerName: customerInfo.name,
        customerSeat: customerSeat || null,
        customerPhone: customerInfo.phone,
        notes: orderNote,
        applied_coupon: activeCoupon ? activeCoupon.code : null,
        discount_amount: getDiscountAmount()
      };
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        localStorage.setItem('customerPhone', customerInfo.phone);

        setOrderConfirmedUI(true);
        setCurrentCart([]);
        setOrderNote('');
        setActiveCoupon(null);
        setShowCustomerForm(false);
        setCustomerInfo({ name: '', phone: '' });
        setOtpCode('');
        setOtpSent(false);
        setMockOtpToast(null);
        setConfirmationResult(null);

        // Refresh orders immediately so tracking badge shows up
        fetchTrackingStatus();

        setTimeout(() => setOrderConfirmedUI(false), 5000);
      }
    } catch (e) {
      console.error("Order Failed:", e);
      alert('Something went wrong while placing the order. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const isBooking = getCartCount() > 0;
    if ((isBooking && !customerInfo.name) || !customerInfo.phone || customerInfo.phone.length !== 10) {
      alert(isBooking ? 'Please enter your name and a valid 10-digit phone number.' : 'Please enter a valid 10-digit phone number.');
      return;
    }
    setupRecaptcha();
    setIsSendingOtp(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, `+91${customerInfo.phone}`, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (error) {
      console.error("Firebase Auth Error:", error);
      // MOCK FALLBACK FOR TESTING IF FIREBASE SMS FAILS
      const dummyOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Use a custom Toast instead of blocking alert so the user can type it easily
      setMockOtpToast(dummyOtp);

      setConfirmationResult({
        confirm: async (code) => {
          if (code !== dummyOtp) throw new Error("Invalid testing OTP");
          return true;
        }
      });
      setOtpSent(true);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpAndOrder = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      alert('Please enter the 6-digit OTP.');
      return;
    }
    setIsSubmittingOrder(true);
    try {
      await confirmationResult.confirm(otpCode);

      localStorage.setItem('customerName', customerInfo.name);
      localStorage.setItem('customerPhone', customerInfo.phone);
      setIsCustomerLoggedIn(true);

      if (getCartCount() > 0) {
        // Success, now process order
        await completeOrderProcess();
      } else {
        setShowCustomerForm(false);
        setOtpSent(false);
        setOtpCode('');
        setIsSubmittingOrder(false);
        fetchTrackingStatus();
      }
    } catch (error) {
      console.error(error);
      alert('Invalid OTP entered.');
      setIsSubmittingOrder(false);
    }
  };

  const proceedToAuthOrOrder = () => {
    const phone = localStorage.getItem('customerPhone');
    if (phone && customerInfo.name && customerInfo.phone) {
      // Auto submit order if already logged in
      completeOrderProcess();
    } else {
      setShowCustomerForm(true);
      setShowCartSummary(false);
    }
  };

  const initiateCheckout = () => {
    if (getCartCount() === 0) {
      alert('Your cart is empty. Please add some items first.');
      return;
    }

    // Check if table has active orders and we haven't asked for a seat yet
    if (activeOrders.length > 0 && !customerSeat) {
      setShowSeatSelection(true);
      setShowCartSummary(false);
      return;
    }

    proceedToAuthOrOrder();
  };

  const toggleCategory = (cat) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
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
      alert('Thank you for your feedback!');
      setShowFeedbackPopup(false);
      setFeedback({ rating: 5, comment: '', name: '', phone: '' });
    } catch (e) { console.error("Feedback failed:", e); }
  };

  return (
    <div className="avatar-screen animate-fade-in video-call-bg">
      <div className="top-call-gradient"></div>
      <div className="avatar-header">
        <div className="header-badge">
          <span  className="ext-cls-b72ed605">Table</span> {tableNumber}
          {customerSeat && (
            <span  className="ext-cls-6f678e19">{customerSeat}</span>
          )}
          <span  className="ext-cls-484b29e1">|</span>
          <span  className="ext-cls-524b4cd3">₹{getCartTotal()}</span>
        </div>
        <div  className="ext-cls-021fa4e0">
          <ThemeToggle />
          {isCustomerLoggedIn && activeOrders.length > 0 && (
            <button
              onClick={() => setShowOrderTracking(true)}
              className="robot-header-btn tracking"
            >
              <Clock size={14} color="#a78bfa" />
              <span className="hide-on-mobile">Tracking</span>
              {activeOrders.length > 0 && (
                <span  className="ext-cls-1ce196f4">
                  {activeOrders.length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setShowFeedbackPopup(true)}
            className="robot-header-btn"
          >
            <span  className="ext-cls-ae3b32ee">★</span>
            <span className="hide-on-mobile">Feedback</span>
          </button>

          {isCustomerLoggedIn ? (
            <button
              onClick={() => {
                localStorage.removeItem('customerPhone');
                localStorage.removeItem('customerName');
                setCustomerInfo({ name: '', phone: '' });
                setIsCustomerLoggedIn(false);
                setActiveOrders([]);
                setShowOrderTracking(false);
              }}
              className="robot-header-btn st-cls-c767cd7c"
              
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          ) : (
            <button
              onClick={() => setShowCustomerForm(true)}
              className="robot-header-btn st-cls-c4843ad3"
              
            >
              <UserCircle size={16}  className="ext-cls-5da48443" />
              <span className="hide-on-mobile">Login</span>
            </button>
          )}
        </div>
      </div>

      <div className="avatar-container">
        <MenuSystem
          restaurantName={restaurantName || 'AI RESTO'}
          menuCategories={menuCategories}
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
          getMediaUrl={getMediaUrl}
          setZoomedImage={setZoomedImage}
          currentCart={currentCart}
          availableCoupons={availableCoupons}
          activeCoupon={activeCoupon}
          setActiveCoupon={setActiveCoupon}
          getDiscountAmount={getDiscountAmount}
        />



        {orderConfirmedUI && (
          <div className="order-success-overlay scale-in">
            <CheckCircle size={48} color="white" fill="var(--success)" />
            <p>{'Order Confirmed!'}</p>
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


        {/* <div  className="ext-cls-880eedeb">
          {voiceInputString && (
            <div className="animate-fade-in ext-cls-a9d3c133" >
              {voiceInputString}
            </div>
          )}
          <button
            onClick={handleMicClick}
            className={`scale-hover ${isListening ? 'pulse' : ''}`}
            style={{
              width: '64px', height: '64px', borderRadius: '32px', border: 'none',
              background: isListening ? '#f59e0b' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: 'white', boxShadow: isListening ? '0 0 20px rgba(245, 158, 11, 0.6)' : '0 10px 20px rgba(124, 58, 237, 0.4)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
            }}
          >
            <Mic size={28} />
          </button>
        </div> */}

        {/* {isAiProcessing && (
          <div className="ai-typing-indicator slide-up">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )} */}
      </div>



      {showCartSummary && (
        <CartOverlay
          currentCart={currentCart}
          orderNote={orderNote}
          setOrderNote={setOrderNote}
          setShowCartSummary={setShowCartSummary}
          getMediaUrl={getMediaUrl}
          setZoomedImage={setZoomedImage}
          handleManualCartUpdate={handleManualCartUpdate}
          getCartTotal={getCartTotal}
          getCartSubtotal={getCartSubtotal}
          getCartTax={getCartTax}
          restaurantData={restaurantData}
          completeOrderProcess={initiateCheckout}
          availableCoupons={availableCoupons}
          activeCoupon={activeCoupon}
          setActiveCoupon={setActiveCoupon}
          getDiscountAmount={getDiscountAmount}
        />
      )}





      {zoomedImage && (
        <div className="image-zoom-overlay" onClick={() => setZoomedImage(null)}>
          <div className="zoomed-image-container slide-up" onClick={e => e.stopPropagation()}>
            <button className="close-zoom-btn" onClick={() => setZoomedImage(null)}>×</button>
            <img src={zoomedImage} alt="Zoomed dish" />
          </div>
        </div>
      )}

      {showSeatSelection && (
        <div className="modal-overlay ext-cls-02b1ca14"  onClick={() => setShowSeatSelection(false)}>
          <div className="booking-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div  className="ext-cls-91d58929">
              <h3 className="view-title ext-cls-e7deb31c" >Shared Table 🪑</h3>
              <button className="close-modal-btn ext-cls-1cc350ab"  onClick={() => setShowSeatSelection(false)}><X size={24} /></button>
            </div>
            <p className="text-muted ext-cls-02be399f" >
              There are other active orders on this table. Please specify your <strong>Seat Number</strong> or <strong>Name</strong> so the waiter knows who ordered this!
            </p>
            <div className="booking-form">
              <div  className="ext-cls-038ac31c">
                {['Seat A', 'Seat B', 'Seat C', 'Seat D', 'Seat E', 'Seat F'].map(seat => (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => {
                      setCustomerSeat(seat);
                      setShowSeatSelection(false);
                      if (currentCart && currentCart.length > 0) {
                        setTimeout(() => proceedToAuthOrOrder(), 50);
                      }
                    }}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: customerSeat === seat ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      background: customerSeat === seat ? 'var(--sidebar-hover)' : 'var(--bg-deep)',
                      color: customerSeat === seat ? 'var(--accent-primary)' : 'var(--text-main)',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {seat}
                  </button>
                ))}
              </div>

              <div  className="ext-cls-d3115725">
                <span  className="ext-cls-279028dd" />
                <span  className="ext-cls-34ccc8e3">OR TYPE CUSTOM</span>
                <span  className="ext-cls-279028dd" />
              </div>

              <input
                className="modal-input"
                placeholder="e.g. Kid seat, or Red Shirt"
                value={customerSeat}
                onChange={(e) => setCustomerSeat(e.target.value)}
              />
              <button
                className="btn-primary ext-cls-7bc384a3"
                
                onClick={() => {
                  if (!customerSeat) { alert('Please select or specify your seat details.'); return; }
                  setShowSeatSelection(false);
                  if (currentCart && currentCart.length > 0) {
                    proceedToAuthOrOrder();
                  }
                }}
              >
                Continue to Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomerForm && (
        <div className="modal-overlay" onClick={() => {
          setShowCustomerForm(false);
        }}>
          <div className="booking-modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              {getCartCount() > 0 ? 'Booking Details' : 'Login / Identify'}
            </h3>
            <p className="modal-subtitle">
              {getCartCount() > 0 ? 'Please provide your details to confirm the order.' : 'Enter your details to view past orders.'}
            </p>
            <form onSubmit={otpSent ? handleVerifyOtpAndOrder : handleSendOtp} className="modal-form">
              {getCartCount() > 0 && (
                <div className="form-group">
                  <label>{'Full Name'}</label>
                  <input
                    type="text"
                    required={getCartCount() > 0}
                    disabled={otpSent}
                    className="modal-input"
                    placeholder={'Enter your name'}
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group">
                <label>{'Phone Number'}</label>
                <input
                  type="tel"
                  required
                  disabled={otpSent}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="modal-input"
                  placeholder={'10-digit number'}
                  value={customerInfo.phone}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    setCustomerInfo({ ...customerInfo, phone: onlyNums.slice(0, 10) });
                  }}
                />
              </div>

              {otpSent && (
                <div className="form-group">
                  <label  className="ext-cls-1bdb758b">
                    <span>{'OTP Code'}</span>
                    {mockOtpToast && (
                      <span  className="ext-cls-6fdc2e24">
                        Test OTP: {mockOtpToast}
                      </span>
                    )}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={6}
                    className="modal-input"
                    placeholder={'Enter 6-digit OTP'}
                    value={otpCode}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                      setOtpCode(onlyNums.slice(0, 6));
                    }}
                  />
                </div>
              )}

              <div id="recaptcha-container"  className="ext-cls-e032a669"></div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary flex-1" onClick={() => {
                  setShowCustomerForm(false);
                  setCustomerInfo({ name: '', phone: '' });
                  setOtpCode('');
                  setOtpSent(false);
                  setMockOtpToast(null);
                  setConfirmationResult(null);
                }}>
                  {'Cancel'}
                </button>

                {!otpSent ? (
                  <button type="submit" disabled={isSendingOtp} className={`btn-primary flex-1 ${isSendingOtp ? 'loading' : ''}`}>
                    {isSendingOtp ? ('Sending...') : ('Send OTP')}
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmittingOrder || otpCode.length !== 6} className={`btn-primary flex-1 ${isSubmittingOrder ? 'loading' : ''}`} style={{ background: otpCode.length === 6 ? 'linear-gradient(135deg, #00e676 0%, #10b981 100%)' : '' }}>
                    {isSubmittingOrder ? ('Processing...') : (getCartCount() > 0 ? 'Confirm Order' : 'Verify & Login')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {showFeedbackPopup && (
        <div className="modal-overlay" onClick={() => setShowFeedbackPopup(false)}>
          <div className="feedback-modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowFeedbackPopup(false)} className="close-modal-btn"><X size={24} /></button>

            <div className="feedback-header">
              <div className="feedback-emoji">⭐</div>
              <h3 className="modal-title">
                {'How was your experience?'}
              </h3>
              <p className="modal-subtitle">
                {'Your feedback helps us improve.'}
              </p>
            </div>

            <div className="star-rating-row">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setFeedback({ ...feedback, rating: star })}
                  className={`star-btn ${feedback.rating >= star ? 'active' : ''}`}
                >
                  ⭐
                </button>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); submitFeedback(); }} className="modal-form">
              <div className="form-group">
                <input
                  type="text"
                  className="modal-input"
                  placeholder={'Your Name (Optional)'}
                  value={feedback.name}
                  onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  className="modal-input"
                  placeholder={'Phone Number (Optional)'}
                  value={feedback.phone}
                  onChange={(e) => setFeedback({ ...feedback, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <textarea
                  className="modal-input textarea"
                  placeholder={'Any other comments? (Optional)'}
                  value={feedback.comment}
                  onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                  rows="3"
                />
              </div>
              <button
                type="submit"
                className="btn-primary full-width ext-cls-12eba061"
                
              >
                {'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Modal - Redesigned for Multiple Orders */}
      {showOrderTracking && activeOrders.length > 0 && (
        <div className="modal-overlay ext-cls-b2d763c9" >
          <div className="tracking-modal animate-slide-up">
            <div className="tracking-header">
              <div className="tracking-header-info">
                <h3>My Orders</h3>
                <p>Full History</p>
              </div>
              <button className="close-tracking-btn" onClick={() => setShowOrderTracking(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="tracking-body scrollbar-hidden">
              {activeOrders.map((order, orderIdx) => (
                <div key={order.id} className="order-tracking-card">
                  <div className="order-id-row">
                    <div className="order-id-meta">
                      <span className="order-id-badge">
                        #ORDER-{order.id}
                        <span  className="ext-cls-2c474884">🍽️ Table {order.tableNumber}</span>
                        {order.customerSeat && <span  className="ext-cls-2c474884">🪑 {order.customerSeat}</span>}
                        {order.customerName && <span  className="ext-cls-2c474884">👤 {order.customerName}</span>}
                      </span>
                      <span className="order-amount-text">₹{order.total}</span>
                    </div>
                    <span className="order-time-text">{new Date(order.timestamp).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="ordered-items-box">
                    <p className="box-label">Ordered Items</p>
                    <div className="items-list-tiny">
                      {order.items.map((item, i) => (
                        <div key={i} className="tiny-item-row">
                          <span className="item-name-qty">{item.qty}x {item.name} {item.selectedVariant && <span  className="ext-cls-7428a996">({item.selectedVariant.size})</span>} {item.selectedAddons && item.selectedAddons.length > 0 && <span  className="ext-cls-240e9bcd">[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}</span>
                          <span className="item-price-sum">₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="timeline-container">
                    <div className="timeline-line" />

                    {[
                      { key: 'pending', label: 'Placed', icon: ListTodo },
                      { key: 'accepted', label: 'Accepted', icon: CheckCircle },
                      { key: 'preparing', label: 'Cooking', icon: ChefHat },
                      { key: 'ready', label: 'Ready', icon: Store },
                      { key: 'completed', label: 'Served', icon: CheckCheck }
                    ].map((step, i) => {
                      const statuses = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'completed'];
                      const currentIndex = statuses.indexOf(order.status);
                      const stepIndex = statuses.indexOf(step.key);
                      const isCompleted = stepIndex < currentIndex || (step.key === 'completed' && order.status === 'completed');
                      const isActive = (step.key === order.status || (step.key === 'ready' && order.status === 'out_for_delivery')) && !isCompleted;

                      return (
                        <div key={i} className={`timeline-step ${isCompleted || isActive ? 'active' : ''}`}>
                          <div className={`step-dot ${isCompleted ? 'completed' : isActive ? 'current' : ''}`} />

                          <div className="step-content">
                            <div className={`step-icon-box ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                              <step.icon size={18} />
                            </div>
                            <span className={`step-label ${isCompleted ? 'completed' : ''}`}>{step.label}</span>
                            {isActive && <div className="status-dot-glow" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="tracking-footer">
              <button
                className="close-tracking-footer-btn"
                onClick={() => setShowOrderTracking(false)}
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RobotChat;