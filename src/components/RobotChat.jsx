import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, X, Clock, ChefHat, Store, ListTodo, Mic, LogOut, UserCircle, CheckCheck } from 'lucide-react';
import { io } from 'socket.io-client';
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../firebase';
import { API_URL } from '../config';
import MenuSystem from './MenuSystem';
import CartOverlay from './CartOverlay';
import ThemeToggle from './ThemeToggle';
const socket = io(API_URL, {
  autoConnect: true
});
const RobotChat = ({
  tableNumber,
  restaurantId,
  isRoom = false,
  floorName = '',
  isFoodCourt = false,
  organizationId = null,
  branches = []
}) => {
  const [restaurantData, setRestaurantData] = useState(null);
  const [restaurantName, setRestaurantName] = useState(null);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(() => !!localStorage.getItem('customerPhone'));
  const [showCartSummary, setShowCartSummary] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);
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
    name: (localStorage.getItem('customerName') === 'null' ? '' : localStorage.getItem('customerName')) || '',
    phone: (localStorage.getItem('customerPhone') === 'null' ? '' : localStorage.getItem('customerPhone')) || '',
    email: (localStorage.getItem('customerEmail') === 'null' ? '' : localStorage.getItem('customerEmail')) || ''
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
  const parseVoiceCommand = transcript => {
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
      toast("Voice ordering is not supported in this browser. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      setVoiceInputString(`You said: "${transcript}"`);
      parseVoiceCommand(transcript);
    };
    recognition.onerror = e => {
      setIsListening(false);
      setVoiceInputString("Microphone error.");
      setTimeout(() => setVoiceInputString(''), 2000);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };
  const getMediaUrl = url => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };
  const [qrSettings, setQrSettings] = useState(null);
  useEffect(() => {
    const initApp = async () => {
      setIsGlobalLoading(true);
      if (!restaurantId) {
        setIsGlobalLoading(false);
        return;
      }
      try {
        const restRes = await fetch(`${API_URL}/api/restaurants`);
        const restData = await restRes.json();
        const mine = (restData.data || []).find(r => String(r.id) === String(restaurantId));
        if (mine) {
          setRestaurantName(mine.name);
          setRestaurantData(mine);
        }
        const settingsRes = await fetch(`${API_URL}/api/settings?restaurant_id=${restaurantId}`);
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.data) {
          const config = settingsData.data;
          setQrSettings(config);
          if (config.primary_color) {
            document.documentElement.style.setProperty('--accent-primary', config.primary_color);
            document.documentElement.style.setProperty('--accent-secondary', config.secondary_color || config.primary_color);
            document.documentElement.style.setProperty('--bg-deep', config.background_color || '#0a0a0b');
            document.documentElement.style.setProperty('--card-bg', config.card_color || '#1a1a24');
            document.documentElement.style.setProperty('--text-main', config.text_color || '#ffffff');
          }
        }
        const qrConfRes = await fetch(`${API_URL}/api/mgmt/qr-config?restaurant_id=${restaurantId}`);
        const qrConfData = await qrConfRes.json();
        if (qrConfData.success && qrConfData.data) {
          setQrSettings(prev => ({
            ...prev,
            qrConfig: qrConfData.data
          }));
        }
        await fetchMenuData();
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
      if (isFoodCourt && branches && branches.length > 0) {
        const promises = branches.map(async b => {
          try {
            const res = await fetch(`${API_URL}/api/menu?restaurant_id=${b.id}`);
            const resJson = await res.json();
            return (resJson.data || []).map(item => ({
              ...item,
              stall_id: b.id,
              stall_name: b.name
            }));
          } catch (e) {
            console.error(`Failed to fetch menu for stall ${b.name}`, e);
            return [];
          }
        });
        const results = await Promise.all(promises);
        const allItems = results.flat();
        const uniqueCategoryNames = Array.from(new Set(allItems.map(i => i.category || 'Other')));
        const grouped = uniqueCategoryNames.map(catName => ({
          category: catName,
          items: allItems.filter(item => (item.category || 'Other') === catName)
        }));
        grouped.sort((a, b) => a.category.localeCompare(b.category));
        setMenuCategories(grouped.filter(g => g.items.length > 0));
        setExpandedCats(new Set(uniqueCategoryNames));
      } else {
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
      }
    } catch (e) {
      console.error("Menu Fetch Error:", e);
    }
  };
  const fetchTrackingStatus = useCallback(async () => {
    try {
      const userPhone = localStorage.getItem('customerPhone') || '';
      const tableUrl = `${API_URL}/api/orders/track/${tableNumber}?restaurant_id=${restaurantId}`;
      const tableRes = await fetch(tableUrl);
      const tableData = await tableRes.json();
      const tableHasOrders = tableData.orders && tableData.orders.length > 0;
      if (tableHasOrders && !customerSeat) {
        setShowSeatSelection(true);
      }
      if (userPhone) {
        const userUrl = `${tableUrl}&phone=${encodeURIComponent(userPhone)}`;
        const userRes = await fetch(userUrl);
        const userData = await userRes.json();
        if (userData.orders && userData.orders.length > 0) {
          setActiveOrders(userData.orders);
          const anyReady = userData.orders.some(o => o.status === 'ready' || o.status === 'out_for_delivery');
          const prevAnyReady = activeOrders.some(o => o.status === 'ready' || o.status === 'out_for_delivery');
          const wasPreviouslyEmpty = activeOrders.length === 0;
          if (!wasPreviouslyEmpty && anyReady && !prevAnyReady) {
            setShowOrderTracking(true);
          }
        } else {
          setActiveOrders([]);
          setShowOrderTracking(false);
        }
      } else {
        setActiveOrders([]);
        setShowOrderTracking(false);
      }
      initialFetchDone.current = true;
    } catch (e) {
      console.error("Tracking fetch failed", e);
    }
  }, [tableNumber, restaurantId, activeOrders, customerSeat]);
  useEffect(() => {
    fetchTrackingStatus();
  }, [tableNumber, restaurantId]);
  useEffect(() => {
    if (!tableNumber || !restaurantId) return;
    const handleOrderUpdate = updatedOrder => {
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
  const getCartSubtotal = () => currentCart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const getDiscountAmount = () => {
    if (!activeCoupon) return 0;
    const subtotal = getCartSubtotal();
    if (activeCoupon.min_order_value && subtotal < activeCoupon.min_order_value) return 0;
    const eligibleSubtotal = currentCart.reduce((acc, item) => {
      if (item.allow_coupons === false) return acc;
      return acc + item.price * item.qty;
    }, 0);
    if (eligibleSubtotal === 0) return 0;
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
    const taxPercent = Number(restaurantData?.tax_percent !== undefined ? restaurantData?.tax_percent : 5.0);
    const halfTaxRate = taxPercent / 2 / 100;
    const cgstRate = restaurantData?.cgst !== undefined ? Number(restaurantData?.cgst) / 100 : halfTaxRate;
    const sgstRate = restaurantData?.sgst !== undefined ? Number(restaurantData?.sgst) / 100 : halfTaxRate;
    return {
      cgst: discountedSubtotal * cgstRate,
      sgst: discountedSubtotal * sgstRate
    };
  };
  const getCartTotal = () => {
    const discountedSubtotal = Math.max(0, getCartSubtotal() - getDiscountAmount());
    const {
      cgst,
      sgst
    } = getCartTax();
    let total = discountedSubtotal + cgst + sgst;
    if (restaurantData?.is_round_off) {
      return Math.floor(total);
    }
    return Number(total.toFixed(2));
  };
  const getCartCount = () => currentCart.reduce((acc, item) => acc + item.qty, 0);
  const handleManualCartUpdate = (item, delta, variant = null, addons = []) => {
    setCurrentCart(prev => {
      const sortedAddons = [...addons].sort((a, b) => a.name.localeCompare(b.name));
      const addonsStr = sortedAddons.length > 0 ? `+${sortedAddons.map(a => a.name).join('+')}` : '';
      const cartItemId = variant ? `${item.id}-${variant.size}${addonsStr}` : `${item.id}${addonsStr}`;
      const existing = prev.find(i => (i.cartId || String(i.id)) === cartItemId);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter(i => (i.cartId || String(i.id)) !== cartItemId);
        return prev.map(i => (i.cartId || String(i.id)) === cartItemId ? {
          ...existing,
          qty: newQty
        } : i);
      }
      if (delta > 0) {
        const addonsPrice = sortedAddons.reduce((acc, a) => acc + Number(a.price || 0), 0);
        let baseVariantPrice = Number(variant ? variant.price : item.price);
        let discountedPrice = baseVariantPrice;
        if (item.discount_type === 'percent' && item.discount_value > 0) {
          discountedPrice = baseVariantPrice - baseVariantPrice * (item.discount_value / 100);
        } else if (item.discount_type === 'flat' && item.discount_value > 0) {
          discountedPrice = baseVariantPrice - item.discount_value;
        }
        if (discountedPrice < 0) discountedPrice = 0;
        return [...prev, {
          ...item,
          cartId: cartItemId,
          qty: delta,
          selectedVariant: variant,
          selectedAddons: sortedAddons,
          price: Math.round(discountedPrice) + addonsPrice
        }];
      }
      return prev;
    });
  };
  const normalizeName = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
  const findMenuItemByName = itemName => {
    const query = normalizeName(itemName);
    if (!query) return null;
    const allItems = menuCategories.flatMap(cat => cat.items || []);
    return allItems.find(item => normalizeName(item.name) === query) || allItems.find(item => normalizeName(item.name).includes(query) || query.includes(normalizeName(item.name))) || null;
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
    currentCart.forEach(cartItem => {
      const sameId = targetId !== undefined && targetId !== null && String(cartItem.id) === String(targetId);
      const sameName = targetName && normalizeName(cartItem.name) === targetName;
      if (sameId || sameName) {
        totalQty += Number(cartItem.qty || 0);
      }
    });
    return totalQty;
  };
  const [tipAmount, setTipAmount] = useState(0);
  const [deliveryInstruction, setDeliveryInstruction] = useState('');
  const completeOrderProcess = async e => {
    if (e) e.preventDefault();
    if (getCartCount() === 0) return;
    if (qrSettings?.qrConfig?.requireLogin && !isCustomerLoggedIn) {
      toast('Please login to place your order.');
      setShowCustomerForm(true);
      setShowCartSummary(false);
      return;
    }
    const storedName = localStorage.getItem('customerName');
    const storedPhone = localStorage.getItem('customerPhone');
    const storedEmail = localStorage.getItem('customerEmail');
    const finalName = customerInfo.name || (storedName !== 'null' ? storedName : '') || 'Valued Guest';
    const finalPhone = customerInfo.phone || (storedPhone !== 'null' ? storedPhone : '');
    const finalEmail = customerInfo.email || (storedEmail !== 'null' ? storedEmail : '');
    const isMobileRequired = qrSettings?.qrConfig?.requireLogin !== false || qrSettings?.qrConfig?.customerDetails?.mobile === 'required';
    if (isMobileRequired) {
      if (!finalPhone) {
        toast('Please enter your phone number.');
        return;
      }
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(finalPhone)) {
        toast('Please enter a valid 10-digit mobile number.');
        return;
      }
    }
    const phonePayload = finalPhone || '0000000000';
    if (isSubmittingOrder) return;
    setIsSubmittingOrder(true);
    try {
      let orderPayloads = [];
      if (isFoodCourt && currentCart.some(i => i.stall_id)) {
        const stallGroups = {};
        currentCart.forEach(item => {
          const sId = item.stall_id || restaurantId;
          if (!stallGroups[sId]) stallGroups[sId] = [];
          stallGroups[sId].push(item);
        });
        Object.keys(stallGroups).forEach(sId => {
          const stallItems = stallGroups[sId];
          const stallSubtotal = stallItems.reduce((acc, i) => acc + i.price * i.qty, 0);
          const totalSubtotal = getCartSubtotal();
          const ratio = totalSubtotal > 0 ? stallSubtotal / totalSubtotal : 1;
          const stallTotal = Math.round((getCartTotal() + tipAmount) * ratio);
          const stallDiscount = getDiscountAmount() * ratio;
          orderPayloads.push({
            restaurant_id: parseInt(sId),
            tableNumber: isRoom ? `Room ${tableNumber}` : tableNumber,
            items: stallItems,
            total: stallTotal,
            status: 'pending',
            customerName: finalName,
            customerSeat: customerSeat || null,
            customerPhone: phonePayload,
            customerEmail: finalEmail || null,
            notes: [orderNote, deliveryInstruction ? `Delivery Instructions: ${deliveryInstruction}` : '', tipAmount > 0 ? `Tip: ₹${Math.round(tipAmount * ratio)}` : ''].filter(Boolean).join('\n'),
            applied_coupon: activeCoupon ? activeCoupon.code : null,
            discount_amount: stallDiscount
          });
        });
      } else {
        orderPayloads.push({
          restaurant_id: restaurantId,
          tableNumber: isRoom ? `Room ${tableNumber}` : tableNumber,
          items: currentCart,
          total: getCartTotal() + tipAmount,
          status: 'pending',
          customerName: finalName,
          customerSeat: customerSeat || null,
          customerPhone: phonePayload,
          customerEmail: finalEmail || null,
          notes: [orderNote, deliveryInstruction ? `Delivery Instructions: ${deliveryInstruction}` : '', tipAmount > 0 ? `Tip: ₹${tipAmount}` : ''].filter(Boolean).join('\n'),
          applied_coupon: activeCoupon ? activeCoupon.code : null,
          discount_amount: getDiscountAmount()
        });
      }
      const submitPromises = orderPayloads.map(async payload => {
        const res = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        return res;
      });
      const responses = await Promise.all(submitPromises);
      const allOk = responses.every(res => res.ok);
      if (allOk) {
        if (finalPhone && finalPhone !== '0000000000') localStorage.setItem('customerPhone', finalPhone);
        if (finalName && finalName !== 'Valued Guest') {
          localStorage.setItem('customerName', finalName);
        }
        setOrderConfirmedUI(true);
        setShowCartSummary(false);
        setCurrentCart([]);
        setOrderNote('');
        setTipAmount(0);
        setDeliveryInstruction('');
        setActiveCoupon(null);
        setShowCustomerForm(false);
        setCustomerInfo({
          name: '',
          phone: ''
        });
        setOtpCode('');
        setOtpSent(false);
        setMockOtpToast(null);
        setConfirmationResult(null);
        fetchTrackingStatus();
        setTimeout(() => setOrderConfirmedUI(false), 5000);
      } else {
        toast('One or more orders failed to submit. Please contact staff.');
      }
    } catch (e) {
      console.error("Order Failed:", e);
      toast('Something went wrong while placing the order. Please try again.');
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
  const handleSendOtp = async e => {
    if (e) e.preventDefault();
    const isBooking = getCartCount() > 0;
    if (isBooking && !customerInfo.name || !customerInfo.phone || customerInfo.phone.length !== 10) {
      toast(isBooking ? 'Please enter your name and a valid 10-digit phone number.' : 'Please enter a valid 10-digit phone number.');
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
      const dummyOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setMockOtpToast(dummyOtp);
      setConfirmationResult({
        confirm: async code => {
          if (code !== dummyOtp) throw new Error("Invalid testing OTP");
          return true;
        }
      });
      setOtpSent(true);
    } finally {
      setIsSendingOtp(false);
    }
  };
  const handleInitialSubmit = e => {
    if (e) e.preventDefault();
    const isBooking = getCartCount() > 0;
    const isLoginRequired = qrSettings?.qrConfig?.requireLogin !== false;
    if (isBooking && !isLoginRequired) {
      if (qrSettings?.qrConfig?.customerDetails?.name === 'required' && !customerInfo.name) {
        toast("Please enter your full name to proceed.");
        return;
      }
      if (qrSettings?.qrConfig?.customerDetails?.mobile === 'required' && (!customerInfo.phone || customerInfo.phone.length !== 10)) {
        toast("Please enter a valid 10-digit phone number to proceed.");
        return;
      }
      if (qrSettings?.qrConfig?.customerDetails?.email === 'required' && !customerInfo.email) {
        toast("Please enter your email to proceed.");
        return;
      }
      completeOrderProcess();
      return;
    }
    if (isGoogleVerified) {
      if ((!customerInfo.phone || customerInfo.phone.length !== 10) && qrSettings?.qrConfig?.loginMethods?.mobileOtp !== false) {
        toast.error("Please provide a 10-digit number to tie to your order.");
        return;
      }
      localStorage.setItem('customerName', customerInfo.name || 'Valued Guest');
      if (customerInfo.phone) {
        localStorage.setItem('customerPhone', customerInfo.phone);
      } else {
        localStorage.setItem('customerPhone', '9999999999');
      }
      setIsCustomerLoggedIn(true);
      if (getCartCount() > 0) {
        completeOrderProcess();
      } else {
        setShowCustomerForm(false);
        fetchTrackingStatus();
      }
    } else {
      handleSendOtp(e);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const newName = user.displayName || 'Google User';
      const newEmail = user.email || '';
      let phoneToUse = user.phoneNumber;
      if (!phoneToUse) {
        phoneToUse = '99' + Math.floor(10000000 + Math.random() * 90000000).toString();
      } else {
        phoneToUse = phoneToUse.replace(/[^0-9]/g, '').slice(-10);
      }
      setCustomerInfo({
        name: newName,
        phone: phoneToUse,
        email: newEmail
      });
      setIsGoogleVerified(true);
      localStorage.setItem('customerName', newName);
      localStorage.setItem('customerPhone', phoneToUse);
      if (newEmail) {
        localStorage.setItem('customerEmail', newEmail);
      }
      setIsCustomerLoggedIn(true);
      toast.success('Logged in successfully!');
      if (getCartCount() > 0) {
        completeOrderProcess();
      } else {
        setShowCustomerForm(false);
        fetchTrackingStatus();
      }
    } catch (e) {
      console.error(e);
      toast.error('Google login failed or closed.');
    }
  };
  const handleVerifyOtpAndOrder = async e => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast('Please enter the 6-digit OTP.');
      return;
    }
    setIsSubmittingOrder(true);
    try {
      await confirmationResult.confirm(otpCode);
      localStorage.setItem('customerName', customerInfo.name);
      localStorage.setItem('customerPhone', customerInfo.phone);
      setIsCustomerLoggedIn(true);
      if (getCartCount() > 0) {
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
      toast.error('Invalid OTP entered.');
      setIsSubmittingOrder(false);
    }
  };
  const proceedToAuthOrOrder = () => {
    const phone = localStorage.getItem('customerPhone');
    const name = localStorage.getItem('customerName');
    const email = localStorage.getItem('customerEmail');
    const isLoginRequired = qrSettings?.qrConfig?.requireLogin !== false;
    const details = qrSettings?.qrConfig?.customerDetails || {};
    const isNameRequired = details.name === 'required';
    const isMobileRequired = details.mobile === 'required';
    const isEmailRequired = details.email === 'required';
    if (isLoginRequired) {
      if (phone && (customerInfo.phone === phone || !customerInfo.phone)) {
        completeOrderProcess();
      } else {
        setShowCustomerForm(true);
        setShowCartSummary(false);
      }
    } else {
      if (isNameRequired && !name && !customerInfo.name || isMobileRequired && !phone && !customerInfo.phone || isEmailRequired && !email && !customerInfo.email) {
        setShowCustomerForm(true);
        setShowCartSummary(false);
      } else {
        completeOrderProcess();
      }
    }
  };
  const initiateCheckout = () => {
    if (getCartCount() === 0) {
      toast('Your cart is empty. Please add some items first.');
      return;
    }
    if (activeOrders.length > 0 && !customerSeat) {
      setShowSeatSelection(true);
      setShowCartSummary(false);
      return;
    }
    proceedToAuthOrOrder();
  };
  const toggleCategory = cat => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);else next.add(cat);
      return next;
    });
  };
  const formatTime = secs => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: '',
    name: '',
    phone: ''
  });
  const submitFeedback = async () => {
    try {
      await fetch(`${API_URL}/api/mgmt/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          table_number: isRoom ? `Room ${tableNumber}` : tableNumber,
          customer_phone: feedback.phone || 'Anonymous',
          customer_name: feedback.name || 'Anonymous',
          rating: feedback.rating,
          comment: feedback.comment
        })
      });
      toast('Thank you for your feedback!');
      setShowFeedbackPopup(false);
      setFeedback({
        rating: 5,
        comment: '',
        name: '',
        phone: ''
      });
    } catch (e) {
      console.error("Feedback failed:", e);
    }
  };
  return <div className="avatar-screen animate-fade-in video-call-bg">
      <div className="top-call-gradient"></div>
      <div className="avatar-header">
        <div className="header-badge">
          <span className="ext-cls-b72ed605">{isRoom ? 'Room' : 'Table'}</span> {tableNumber} {floorName && <span className="text-slate-400 text-[10px] ml-1">({floorName})</span>}
          {customerSeat && <span className="ext-cls-6f678e19">{customerSeat}</span>}
          <span className="ext-cls-484b29e1">|</span>
          <span className="ext-cls-524b4cd3">₹{getCartTotal()}</span>
        </div>
        <div className="ext-cls-021fa4e0">
          <ThemeToggle />
          {isCustomerLoggedIn && activeOrders.length > 0 && <button onClick={() => setShowOrderTracking(true)} className="robot-header-btn tracking">
              <Clock size={14} color="#a78bfa" />
              <span className="hide-on-mobile">Tracking</span>
              {activeOrders.length > 0 && <span className="ext-cls-1ce196f4">
                  {activeOrders.length}
                </span>}
            </button>}
          <button onClick={() => setShowFeedbackPopup(true)} className="robot-header-btn">
            <span className="ext-cls-ae3b32ee">★</span>
            <span className="hide-on-mobile">Feedback</span>
          </button>

          {isCustomerLoggedIn ? <button onClick={() => {
          localStorage.removeItem('customerPhone');
          localStorage.removeItem('customerName');
          setCustomerInfo({
            name: '',
            phone: ''
          });
          setIsCustomerLoggedIn(false);
          setActiveOrders([]);
          setShowOrderTracking(false);
        }} className="robot-header-btn st-cls-c767cd7c" title="Logout">
              <LogOut size={16} />
            </button> : qrSettings?.qrConfig?.requireLogin !== false && <button onClick={() => setShowCustomerForm(true)} className="robot-header-btn st-cls-c4843ad3">
                <UserCircle size={16} className="ext-cls-5da48443" />
                <span className="hide-on-mobile">Login</span>
              </button>}
        </div>
      </div>

      <div className="avatar-container">
        <MenuSystem restaurantName={restaurantName || 'AI RESTO'} menuCategories={menuCategories} menuSearchTerm={menuSearchTerm} setMenuSearchTerm={setMenuSearchTerm} activeCategory={activeCategory} setActiveCategory={setActiveCategory} toggleCategory={toggleCategory} expandedCats={expandedCats} getItemQty={getItemQty} handleManualCartUpdate={handleManualCartUpdate} getCartTotal={getCartTotal} getCartCount={getCartCount} setShowCartSummary={setShowCartSummary} completeOrderProcess={completeOrderProcess} getMediaUrl={getMediaUrl} setZoomedImage={setZoomedImage} currentCart={currentCart} availableCoupons={availableCoupons} activeCoupon={activeCoupon} setActiveCoupon={setActiveCoupon} qrConfig={qrSettings?.qrConfig} getDiscountAmount={getDiscountAmount} isSubmittingOrder={isSubmittingOrder} />



        {orderConfirmedUI && <div className="advanced-success-animation">
            <div className="success-halo"></div>
            <div className="success-icon-wrap">
              <CheckCircle size={54} className="success-check-icon" />
            </div>
            <h2 className="success-title">Order Confirmed!</h2>
            <p className="success-subtitle">Preparing your delicious food 👨‍🍳</p>
          </div>}

        {currentImageUrl && <div className="neural-image-preview scale-in">
            <img src={getMediaUrl(currentImageUrl)} alt="Dish Preview" />
            <div className="neural-scan-line"></div>
          </div>}

        {activeCoupon && <div className="premium-toast coupon-toast slide-up">
            <div className="toast-icon">💸</div>
            <div className="toast-content">
              <strong>{activeCoupon.code} applied!</strong>
              <span>₹{activeCoupon.discount} saved on this order 🎉</span>
            </div>
          </div>}

        {orderTracking && <div className="premium-toast tracking-toast slide-up">
            <div className="toast-icon">👨‍🍳</div>
            <div className="toast-content">
              <strong>{orderTracking.status}</strong>
              <span>ETA: {orderTracking.eta} 🚴</span>
            </div>
          </div>}


        {}

        {}
      </div>



      {showCartSummary && <CartOverlay currentCart={currentCart} orderNote={orderNote} setOrderNote={setOrderNote} setShowCartSummary={setShowCartSummary} getMediaUrl={getMediaUrl} setZoomedImage={setZoomedImage} handleManualCartUpdate={handleManualCartUpdate} getCartTotal={getCartTotal} getCartSubtotal={getCartSubtotal} getCartTax={getCartTax} restaurantData={restaurantData} completeOrderProcess={initiateCheckout} availableCoupons={availableCoupons} activeCoupon={activeCoupon} setActiveCoupon={setActiveCoupon} getDiscountAmount={getDiscountAmount} isSubmittingOrder={isSubmittingOrder} qrSettings={qrSettings} tipAmount={tipAmount} setTipAmount={setTipAmount} deliveryInstruction={deliveryInstruction} setDeliveryInstruction={setDeliveryInstruction} />}





      {zoomedImage && <div className="image-zoom-overlay" onClick={() => setZoomedImage(null)}>
          <div className="zoomed-image-container slide-up" onClick={e => e.stopPropagation()}>
            <button className="close-zoom-btn" onClick={() => setZoomedImage(null)}>×</button>
            <img src={zoomedImage} alt="Zoomed dish" />
          </div>
        </div>}

      {showSeatSelection && <div className="modal-overlay ext-cls-02b1ca14">
          <div className="booking-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="ext-cls-91d58929">
              <h3 className="view-title ext-cls-e7deb31c">Shared Table 🪑</h3>
            </div>
            <p className="text-muted ext-cls-02be399f">
              There are other active orders on this table. Please specify your <strong>Seat Number</strong> or <strong>Name</strong> so the waiter knows who ordered this!
            </p>
            <div className="booking-form">
              <div className="ext-cls-038ac31c">
                {['Seat A', 'Seat B', 'Seat C', 'Seat D', 'Seat E', 'Seat F'].map(seat => <button key={seat} type="button" onClick={() => {
              setCustomerSeat(seat);
              setShowSeatSelection(false);
              if (currentCart && currentCart.length > 0) {
                setTimeout(() => proceedToAuthOrOrder(), 50);
              }
            }} style={{
              padding: '12px 8px',
              borderRadius: '12px',
              border: customerSeat === seat ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
              background: customerSeat === seat ? 'var(--sidebar-hover)' : 'var(--bg-deep)',
              color: customerSeat === seat ? 'var(--accent-primary)' : 'var(--text-main)',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
                    {seat}
                  </button>)}
              </div>

              <div className="ext-cls-d3115725">
                <span className="ext-cls-279028dd" />
                <span className="ext-cls-34ccc8e3">OR TYPE CUSTOM</span>
                <span className="ext-cls-279028dd" />
              </div>

              <input className="modal-input" placeholder="e.g. Kid seat, or Red Shirt" value={customerSeat} onChange={e => setCustomerSeat(e.target.value)} />
              <button className="btn-primary ext-cls-7bc384a3" onClick={() => {
            if (!customerSeat) {
              toast('Please select or specify your seat details.');
              return;
            }
            setShowSeatSelection(false);
            if (currentCart && currentCart.length > 0) {
              proceedToAuthOrOrder();
            }
          }}>
                Continue to Order
              </button>
            </div>
          </div>
        </div>}

      {showCustomerForm && <div className="modal-overlay" onClick={() => {
      setShowCustomerForm(false);
    }}>
          <div className="booking-modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              {getCartCount() > 0 ? 'Booking Details' : 'Login / Identify'}
            </h3>
            <p className="modal-subtitle">
              {getCartCount() > 0 ? 'Please provide your details to confirm the order.' : 'Enter your details to view past orders.'}
            </p>
            <form onSubmit={otpSent ? handleVerifyOtpAndOrder : handleInitialSubmit} className="modal-form">
              {getCartCount() > 0 && qrSettings?.qrConfig?.customerDetails?.name !== 'disabled' && <div className="form-group">
                  <label>{'Full Name'}</label>
                  <input type="text" required={getCartCount() > 0 && !isGoogleVerified && (qrSettings?.qrConfig?.customerDetails?.name === 'required' || !qrSettings?.qrConfig?.customerDetails)} disabled={otpSent || isGoogleVerified} className="modal-input" placeholder={'Enter your name'} value={customerInfo.name} onChange={e => setCustomerInfo({
              ...customerInfo,
              name: e.target.value
            })} />
                </div>}
              {(qrSettings?.qrConfig?.requireLogin !== false && qrSettings?.qrConfig?.loginMethods?.mobileOtp !== false || getCartCount() > 0 && qrSettings?.qrConfig?.customerDetails?.mobile !== 'disabled') && <div className="form-group">
                  <label>{'Phone Number'}</label>
                  <input type="tel" required={getCartCount() === 0 || qrSettings?.qrConfig?.requireLogin !== false && qrSettings?.qrConfig?.loginMethods?.mobileOtp !== false || qrSettings?.qrConfig?.customerDetails?.mobile === 'required'} disabled={otpSent} pattern="[0-9]{10}" maxLength={10} className="modal-input" placeholder={'10-digit number'} value={customerInfo.phone || ''} onChange={e => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, '');
              setCustomerInfo({
                ...customerInfo,
                phone: onlyNums.slice(0, 10)
              });
            }} />
                </div>}
              {getCartCount() > 0 && qrSettings?.qrConfig?.customerDetails?.email !== 'disabled' && <div className="form-group">
                  <label>{'Email Address'}</label>
                  <input type="email" required={!isGoogleVerified && qrSettings?.qrConfig?.customerDetails?.email === 'required'} disabled={otpSent || isGoogleVerified} className="modal-input" placeholder={'Enter your email address'} value={customerInfo.email || ''} onChange={e => setCustomerInfo({
              ...customerInfo,
              email: e.target.value
            })} />
                </div>}

              {otpSent && <div className="form-group">
                  <label className="ext-cls-1bdb758b">
                    <span>{'OTP Code'}</span>
                    {mockOtpToast && <span className="ext-cls-6fdc2e24">
                        Test OTP: {mockOtpToast}
                      </span>}
                  </label>
                  <input type="tel" required maxLength={6} className="modal-input" placeholder={'Enter 6-digit OTP'} value={otpCode} onChange={e => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, '');
              setOtpCode(onlyNums.slice(0, 6));
            }} />
                </div>}

              <div id="recaptcha-container" className="ext-cls-e032a669"></div>

              <div className="ex-style-aba72a">
                <div className="ex-style-d15e4a">
                  <button type="button" className="btn-secondary ex-style-68de98" onClick={() => {
                setShowCustomerForm(false);
                setCustomerInfo({
                  name: '',
                  phone: ''
                });
                setOtpCode('');
                setOtpSent(false);
                setIsGoogleVerified(false);
                setMockOtpToast(null);
                setConfirmationResult(null);
              }}>
                    {'Cancel'}
                  </button>

                  {!otpSent ? qrSettings?.qrConfig?.requireLogin !== false && qrSettings?.qrConfig?.loginMethods?.mobileOtp === false && !isGoogleVerified ? null : <button type="submit" disabled={isSendingOtp || isSubmittingOrder} className={`btn-primary flex-1 ${isSendingOtp || isSubmittingOrder ? 'loading' : ''}`}>
                      {getCartCount() > 0 && qrSettings?.qrConfig?.requireLogin === false ? 'Confirm Order' : isGoogleVerified ? 'Complete Login' : isSendingOtp ? 'Sending...' : 'Send OTP'}
                    </button> : <button type="button" onClick={handleVerifyOtpAndOrder} disabled={isSubmittingOrder || otpCode.length !== 6} className={`btn-primary flex-1 ${isSubmittingOrder ? 'loading' : ''}`} style={{
                background: otpCode.length === 6 ? 'linear-gradient(135deg, #00e676 0%, #10b981 100%)' : ''
              }}>
                      {isSubmittingOrder ? 'Processing...' : getCartCount() > 0 ? 'Confirm Order' : 'Verify & Login'}
                    </button>}
                </div>

                {!otpSent && !isGoogleVerified && qrSettings?.qrConfig?.requireLogin !== false && qrSettings?.qrConfig?.loginMethods?.google !== false && <>
                    {qrSettings?.qrConfig?.loginMethods?.mobileOtp !== false && <div className="ex-style-aae68d">
                        <div className="ex-style-c95ff7"></div>
                        <span className="ex-style-5ab1d0">OR</span>
                        <div className="ex-style-c95ff7"></div>
                      </div>}
                    <button type="button" onClick={handleGoogleLogin} className="btn-secondary" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#1e293b',
                padding: '12px',
                borderRadius: '12px',
                marginTop: qrSettings?.qrConfig?.loginMethods?.mobileOtp === false ? '0' : '8px'
              }}>
                      <img src="https://www.google.com/favicon.ico" alt="G" className="ex-style-7eb649" />
                      <span className="ex-style-da0bad">Continue with Google</span>
                    </button>
                  </>}
              </div>
            </form>
          </div>
        </div>}
      {showFeedbackPopup && <div className="modal-overlay" onClick={() => setShowFeedbackPopup(false)}>
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
              {[1, 2, 3, 4, 5].map(star => <button key={star} onClick={() => setFeedback({
            ...feedback,
            rating: star
          })} className={`star-btn ${feedback.rating >= star ? 'active' : ''}`}>
                  ⭐
                </button>)}
            </div>

            <form onSubmit={e => {
          e.preventDefault();
          submitFeedback();
        }} className="modal-form">
              <div className="form-group">
                <input type="text" className="modal-input" placeholder={'Your Name (Optional)'} value={feedback.name} onChange={e => setFeedback({
              ...feedback,
              name: e.target.value
            })} />
              </div>
              <div className="form-group">
                <input type="tel" className="modal-input" placeholder={'Phone Number (Optional)'} value={feedback.phone} onChange={e => setFeedback({
              ...feedback,
              phone: e.target.value
            })} />
              </div>
              <div className="form-group">
                <textarea className="modal-input textarea" placeholder={'Any other comments? (Optional)'} value={feedback.comment} onChange={e => setFeedback({
              ...feedback,
              comment: e.target.value
            })} rows="3" />
              </div>
              <button type="submit" className="btn-primary full-width ext-cls-12eba061">
                {'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>}

      {}
      {showOrderTracking && activeOrders.length > 0 && <div className="modal-overlay ext-cls-b2d763c9">
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
              {activeOrders.map((order, orderIdx) => <div key={order.id} className="order-tracking-card">
                  <div className="order-id-row">
                    <div className="order-id-meta">
                      <span className="order-id-badge">
                        #ORDER-{order.id}
                        <span className="ext-cls-2c474884">🍽️ Table {order.tableNumber}</span>
                        {order.customerSeat && <span className="ext-cls-2c474884">🪑 {order.customerSeat}</span>}
                        {order.customerName && <span className="ext-cls-2c474884">👤 {order.customerName}</span>}
                      </span>
                      <span className="order-amount-text">₹{order.total}</span>
                    </div>
                    <span className="order-time-text">{new Date(order.timestamp).toLocaleString([], {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
                  </div>

                  <div className="ordered-items-box">
                    <p className="box-label">Ordered Items</p>
                    <div className="items-list-tiny">
                      {order.items.map((item, i) => <div key={i} className="tiny-item-row">
                          <span className="item-name-qty">{item.qty}x {item.name} {item.selectedVariant && <span className="ext-cls-7428a996">({item.selectedVariant.size})</span>} {item.selectedAddons && item.selectedAddons.length > 0 && <span className="ext-cls-240e9bcd">[+{item.selectedAddons.map(a => a.name).join(', ')}]</span>}</span>
                          <span className="item-price-sum">₹{item.price * item.qty}</span>
                        </div>)}
                    </div>
                  </div>

                  <div className="timeline-container">
                    <div className="timeline-line" />

                    {[{
                key: 'pending',
                label: 'Placed',
                icon: ListTodo
              }, {
                key: 'accepted',
                label: 'Accepted',
                icon: CheckCircle
              }, {
                key: 'preparing',
                label: 'Cooking',
                icon: ChefHat
              }, {
                key: 'ready',
                label: 'Ready',
                icon: Store
              }, {
                key: 'completed',
                label: 'Served',
                icon: CheckCheck
              }].map((step, i) => {
                const statuses = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'completed'];
                const currentIndex = statuses.indexOf(order.status);
                const stepIndex = statuses.indexOf(step.key);
                const isCompleted = stepIndex < currentIndex || step.key === 'completed' && order.status === 'completed';
                const isActive = (step.key === order.status || step.key === 'ready' && order.status === 'out_for_delivery') && !isCompleted;
                return <div key={i} className={`timeline-step ${isCompleted || isActive ? 'active' : ''}`}>
                          <div className={`step-dot ${isCompleted ? 'completed' : isActive ? 'current' : ''}`} />

                          <div className="step-content">
                            <div className={`step-icon-box ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                              <step.icon size={18} />
                            </div>
                            <span className={`step-label ${isCompleted ? 'completed' : ''}`}>{step.label}</span>
                            {isActive && <div className="status-dot-glow" />}
                          </div>
                        </div>;
              })}
                  </div>
                </div>)}
            </div>

            <div className="tracking-footer">
              <button className="close-tracking-footer-btn" onClick={() => setShowOrderTracking(false)}>
                Close Tracking
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
export default RobotChat;