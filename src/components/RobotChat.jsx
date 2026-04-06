import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Menu as MenuIcon, ChevronRight, ChevronDown, Video, VideoOff, Settings, Plus, Minus, ShoppingCart, CheckCircle, ChefHat, Play } from 'lucide-react';
import './RobotChat.css';
import { io } from 'socket.io-client';

import { API_URL } from '../config';
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
  const [textLanguage, setTextLanguage] = useState('en'); // Digital UI always English
  const [voiceLanguage, setVoiceLanguage] = useState('hi'); // Neural Voice can be 'hi' (Hinglish) or 'en'
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
  const [isAutoListenEnabled, setIsAutoListenEnabled] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [sensitivity, setSensitivity] = useState(0.05); // Global Sensitivity Threshold
  const [hasNeuralHandshake, setHasNeuralHandshake] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const initializationRef = useRef(false); // 🛡️ Sychronous lock for mobile handshake

  const videoRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const fetchMenu = async () => {
    if (!restaurantId) return;
    try {
      const menuRes = await fetch(`${API_URL}/api/menu?restaurant_id=${restaurantId}`);
      const menuData = await menuRes.json();
      const allItems = menuData.data || [];

      // Get ALL unique categories from the items themselves to ensure nothing is missed
      const uniqueCategoryNames = Array.from(new Set(allItems.map(i => i.category || 'Other')));

      const grouped = uniqueCategoryNames.map(catName => ({
        category: catName,
        items: allItems.filter(item => (item.category || 'Other') === catName)
      }));

      // Sort categories so they look organized
      grouped.sort((a, b) => a.category.localeCompare(b.category));

      setMenuCategories(grouped.filter(g => g.items.length > 0));

      // Expand all categories by default to show items clearly
      setExpandedCats(prev => {
        const next = new Set(prev);
        grouped.forEach(g => next.add(g.category));
        return next;
      });
    } catch (error) {
      console.error("Menu fetch failed:", error);
    }
  };

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/restaurants`);
        const data = await res.json();
        const currentRes = data.data.find(r => Number(r.id) === Number(restaurantId));
        if (currentRes) {
          setRestaurantName(currentRes.name);
        }
      } catch (err) {
        console.error("Failed to fetch restaurant info:", err);
      }
    };
    fetchRestaurantInfo();
  }, [restaurantId]);

  useEffect(() => {
    fetchMenu();
    socket.on('menu_updated', fetchMenu);
    return () => socket.off('menu_updated');
  }, [restaurantId]);

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
    if (!restaurantName || hasGreeted) return;

    const handleInitialGreeting = () => {
      setCurrentSubtitle(dialogs['en'].welcome); // Always English text
      speak(dialogs[voiceLanguage].welcome, voiceLanguage); // Hinglish or English voice
      setHasGreeted(true);
    };

    // Browsers often load voices asynchronously
    if (synthRef.current.getVoices().length > 0) {
      handleInitialGreeting();
    } else {
      synthRef.current.onvoiceschanged = () => {
        handleInitialGreeting();
        synthRef.current.onvoiceschanged = null; // Clean up
      };
    }

    return () => synthRef.current?.cancel();
  }, [restaurantName, dialogs, voiceLanguage, hasGreeted]);

  // --- NEURAL SENTIENT EAR (VAD) ENGINE ---
  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;
    let javascriptNode;

    if (isAutoListenEnabled && hasNeuralHandshake && !isListening && !isRobotSpeaking) {
      async function setupSentientEar() {
        try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          analyser = audioContext.createAnalyser();
          microphone = audioContext.createMediaStreamSource(stream);
          javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;

          microphone.connect(analyser);
          analyser.connect(javascriptNode);
          javascriptNode.connect(audioContext.destination);

          javascriptNode.onaudioprocess = () => {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;
            const length = array.length;
            for (let i = 0; i < length; i++) values += array[i];
            const average = values / length;
            const normalizedVol = average / 255;
            setMicVolume(normalizedVol);

            // NEURAL TRIGGER: High volume detected? -> WAKE UP ROBO
            if (normalizedVol > sensitivity) {
              console.log("⚡ Sentient Ear Triggered!");
              startListening();
              // Clean up self to avoid multi-trigger
              javascriptNode.onaudioprocess = null;
            }
          };
        } catch (err) {
          console.error("Sentient Ear Error:", err);
        }
      }
      setupSentientEar();
    }

    return () => {
      if (javascriptNode) javascriptNode.onaudioprocess = null;
      if (audioContext) audioContext.close();
    };
  }, [isAutoListenEnabled, hasNeuralHandshake, isListening, isRobotSpeaking, sensitivity]);


  const speak = (text, langToSpeak = textLanguage, callback) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();

      // High-Fidelity Voice Selection (Prioritize Google/Premium voices)
      let selectedVoice = (langToSpeak === 'hi')
        ? (voices.find(v => v.name.includes('Google') && v.lang.includes('hi')) ||
          voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')))
        : (voices.find(v => v.name.includes('Google') && v.lang.includes('en')) ||
          voices.find(v => v.lang.includes('en') || v.lang.includes('US')));
      if (isIOS) utterance.lang = "hi-IN";
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 0.95; // Elegant concierge rate
      utterance.pitch = 1.05; // Friendly, professional pitch
      utterance.onstart = () => setIsRobotSpeaking(true);
      utterance.onend = () => {
        setIsRobotSpeaking(false);
        if (callback) callback();
      };
      utterance.onerror = () => {
        setIsRobotSpeaking(false);
        if (callback) callback();
      };
      synthRef.current.speak(utterance);
      if (isIOS) window.speechSynthesis.speak(utterance);
    }
  };


  const startListening = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    // 🛑 TOGGLE OFF logic for both flows
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      setCurrentSubtitle(textLanguage === "hi" ? "माइक बंद है" : "Mic Off");
      return;
    }

    // 🛡️ MOBILE HANDSHAKE: Play greeting first (only on first-ever tap)
    if (!initializationRef.current) {
      initializationRef.current = true;
      setIsSystemActive(true);

      if (!hasGreeted && restaurantName) {
        setIsRobotSpeaking(true);
        setCurrentSubtitle(dialogs['en'].welcome);
        setHasGreeted(true);

        speak(dialogs[voiceLanguage].welcome, voiceLanguage, () => {
          setIsRobotSpeaking(false);
          startListening();
        });

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') await audioContext.resume();
        setHasNeuralHandshake(true);
        return;
      }
    }

    // --- CASE 1: IPHONE / IOS (FREE NATIVE GEMINI FLOW) ---
    if (isIOS) {
      try {
        if (synthRef.current) synthRef.current.cancel();
        setIsRobotSpeaking(false);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 128000
        });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstart = () => {
          setIsListening(true);
          setHasNeuralHandshake(true);
          setCurrentSubtitle(textLanguage === "hi" ? "सुन रहा हूँ..." : "Listening...");
        };

        mediaRecorder.onstop = async () => {
          setIsListening(false);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          // 🚀 Backend-to-Cloud Neural Ear (Secure Flow)
          setIsTranscribing(true);
          setCurrentSubtitle(textLanguage === "hi" ? "प्रोसेसिंग..." : "Processing...");

          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');
          if (voiceLanguage) formData.append('language', voiceLanguage);

          try {
            const resp = await fetch(`${API_URL}/api/transcribe`, {
              method: 'POST',
              body: formData
            });
            const data = await resp.json();
            if (data.text) {
              console.log("✅ Secure Backend Whisper:", data.text);
              setCurrentSubtitle(data.text);
              processMockAIResponse(data.text);
            } else {
              throw new Error(data.error || "Transcription failed");
            }
          } catch (err) {
            console.error("Transcription Error:", err);
            setCurrentSubtitle(textLanguage === "hi" ? "त्रुटि: आवाज़ नहीं समझ पाया" : "Error: Could not process audio");
          } finally {
            setIsTranscribing(false);
            stream.getTracks().forEach(t => t.stop());
          }
        };

        mediaRecorder.start();
      } catch (err) {
        console.error("iOS Audio Error:", err);
        setCurrentSubtitle(textLanguage === "hi" ? "माइक परमिशन allow करो" : "Grant mic permission to speak");
      }
      return;
    }

    // --- CASE 2: ANDROID / DESKTOP (BROWSER SPEECH RECOGNITION) ---
    if (!SpeechRecognition) {
      setCurrentSubtitle(textLanguage === "hi" ? "आपका ब्राउज़र माइक सपोर्ट नहीं करता" : "Speech Recognition not supported");
      return;
    }

    try {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (synthRef.current) synthRef.current.cancel();
      setIsRobotSpeaking(false);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = voiceLanguage === "hi" ? "hi-IN" : "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setHasNeuralHandshake(true);
        setCurrentSubtitle(textLanguage === "hi" ? "सुन रहा हूँ (Web)..." : "Listening (Web)...");
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentSubtitle(transcript);
        const last = event.results[event.results.length - 1];
        if (last.isFinal) {
          console.log("✅ Standard Speech:", transcript);
          processMockAIResponse(transcript);
        }
      };

      recognition.onerror = (e) => {
        console.error("🎤 recognition Error:", e.error);
        let msg = (e.error === "not-allowed") ? (textLanguage === "hi" ? "माइक परमिशन allow करो" : "Allow microphone permission") : e.error;
        setCurrentSubtitle(msg);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      setTimeout(() => recognition.start(), 200);

    } catch (err) {
      console.error("❌ Failed:", err);
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
          chatHistory: updatedHistory,
          restaurantId: restaurantId
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

      // if (userText.toLowerCase().includes('menu') || userText.includes('मेनू')) setShowMenuPopup(true);
    } catch (err) {
      setIsAiTyping(false);
      console.error("AI Response Error:", err);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const handleManualCartUpdate = (item, delta) => {
    if (!item || !item.id) return;
    setCurrentCart(prevCart => {
      const newCart = [...prevCart];
      const existingIdx = newCart.findIndex(i => String(i.id) === String(item.id));
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
    if (id === undefined || id === null) return 0;
    const itm = currentCart.find(i => String(i.id) === String(id));
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
      const msg = dialogs[textLanguage].confirm(total);
      setCurrentSubtitle(msg);
      speak(dialogs[voiceLanguage].confirm(total), voiceLanguage);
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
        <div className={`avatar-pulse-ring ${isRobotSpeaking ? 'speaking' : ''} ${isListening ? 'listening-ring' : ''} ${micVolume > sensitivity ? 'vocal-spike' : ''}`}></div>
        <img src="/avatar.png" alt="AI Waiter Avatar" className={`waiter-avatar breathing-idle ${isRobotSpeaking ? 'animate-talk' : ''} ${micVolume > sensitivity ? 'listening-pulse' : ''}`} />
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
                        const isUnavailable = item.is_active === false;
                        return (
                          <div key={item.id} className={`premium-menu-item animate-slide-up ${isUnavailable ? 'unavailable' : ''}`}>
                            <div className="item-media">
                              {item.image_url ? (
                                <img src={getMediaUrl(item.image_url)} alt={item.name} className="item-thumb" />
                              ) : (
                                <div className="item-thumb-placeholder"><ChefHat size={24} /></div>
                              )}
                              {isUnavailable && <div className="unavailable-overlay">SOLD OUT</div>}
                              {item.video_url && <div className="video-dot-indicator"><Play size={8} fill="white" /></div>}
                            </div>

                            <div className="item-details">
                              <div className="item-header">
                                <h6 className="item-name">{item.name}</h6>
                                <span className="item-price">₹{item.price}</span>
                              </div>
                              <p className="item-description">{item.description || item.desc || "Delicately crafted for your tech palate."}</p>
                              <div className="item-actions-row">
                                {isUnavailable ? (
                                  <button className="add-btn-disabled" disabled>Unavailable</button>
                                ) : qty === 0 ? (
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
              <div className="cart-total" onClick={() => setShowCartSummary(true)} style={{ cursor: 'pointer' }}>
                <ShoppingCart size={20} />
                <span>₹{getCartTotal()}</span>
                <span className="cart-view-hint">View Cart</span>
              </div>
              <button className="confirm-btn-footer" onClick={() => completeOrderProcess()}>
                {textLanguage === 'hi' ? 'आर्डर बुक करें' : 'Confirm Order'} <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {showCartSummary && (
        <div className="cart-summary-overlay animate-fade-in" onClick={() => setShowCartSummary(false)}>
          <div className="cart-summary-modal slide-up" onClick={e => e.stopPropagation()}>
            <div className="cart-summary-header">
              <h3>{textLanguage === 'en' ? 'Review Your Order' : 'आपका आर्डर'}</h3>
              <button className="close-cart-btn" onClick={() => setShowCartSummary(false)}>×</button>
            </div>

            <div className="cart-summary-items scrollbar-hidden">
              {currentCart.map((item) => (
                <div key={item.id} className="cart-summary-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">₹{item.price} each</span>
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-controls-premium">
                      <button onClick={() => handleManualCartUpdate(item, -1)}><Minus size={14} /></button>
                      <span className="qty-val">{item.qty}</span>
                      <button onClick={() => handleManualCartUpdate(item, 1)}><Plus size={14} /></button>
                    </div>
                    <span className="cart-item-subtotal">₹{item.price * item.qty}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-footer">
              <div className="cart-final-total">
                <span>{textLanguage === 'en' ? 'Total Amount' : 'कुल राशि'}</span>
                <strong>₹{getCartTotal()}</strong>
              </div>
              <button className="final-checkout-btn" onClick={() => {
                completeOrderProcess();
                setShowCartSummary(false);
              }}>
                {textLanguage === 'en' ? 'Finalize & Book Order' : 'आर्डर बुक करें'}
              </button>
            </div>
          </div>
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
          <button className={`call-btn secondary-btn ${!isCameraOn ? 'muted' : ''}`} onClick={toggleCamera} title="Camera">
            {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
          <button className={`call-btn active-call-btn ${isListening ? 'listening' : ''}`} onClick={startListening} title="Speak">
            {isListening ? <Mic size={28} /> : <MicOff size={28} />}
          </button>
          <button className="call-btn secondary-btn" onClick={() => setShowSettingsPopup(true)} title="Settings"><Settings size={22} /></button>
          <button className="call-btn danger-btn end-call-btn" onClick={() => window.location.reload()}><PhoneOff size={28} /></button>
        </div>
      </div>
    </div>
  );
};

export default RobotChat;