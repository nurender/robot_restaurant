import { useState, useRef, useCallback } from 'react';
import { API_URL } from '../config';

const useRealtime = (restaurantId, _tableNumber, handlers = {}) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [analyzer, setAnalyzer] = useState(null);
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);
  const audioStream = useRef(null);
  const audioElRef = useRef(null);
  const toolCallStateRef = useRef(new Map());
  const handledToolCallsRef = useRef(new Set());
  
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const stopSession = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (audioStream.current) {
      audioStream.current.getTracks().forEach((t) => t.stop());
      audioStream.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.remove();
      audioElRef.current = null;
    }
    dataChannel.current = null;
    toolCallStateRef.current.clear();
    handledToolCallsRef.current.clear();
    setIsSessionActive(false);
    setIsConnecting(false);
    setAnalyzer(null);
  }, []);

  const emitToolCall = useCallback((name, args = {}, callId) => {
    if (!name) return;
    if (callId && handledToolCallsRef.current.has(callId)) return;
    if (callId) handledToolCallsRef.current.add(callId);
    handlersRef.current.onToolCall?.({ name, args, callId });
  }, []);

  const parseArgs = (rawArgs) => {
    if (!rawArgs) return {};
    if (typeof rawArgs === 'object') return rawArgs;
    if (typeof rawArgs !== 'string') return {};
    try {
      return JSON.parse(rawArgs);
    } catch {
      return {};
    }
  };

  const onRealtimeEvent = useCallback((event) => {
    if (!event || typeof event !== 'object') return;

    if (event.type?.includes('response') && typeof event.text === 'string') {
      handlersRef.current.onResponse?.(event.text);
    }

    if (event.type === 'response.output_text.delta' && typeof event.delta === 'string') {
      handlersRef.current.onResponse?.(event.delta);
    }

    if (event.type === 'cart.update' && Array.isArray(event.items)) {
      handlersRef.current.onCartUpdate?.(event.items);
    }

    if (event.type === 'menu.show') {
      handlersRef.current.onShowMenu?.(event.category);
    }

    if (event.type === 'order.confirm') {
      handlersRef.current.onConfirmOrder?.();
    }

    if (event.type === 'response.output_item.added' && event.item?.type === 'function_call') {
      const callId = event.item.call_id || event.item.id;
      if (!callId) return;
      const existing = toolCallStateRef.current.get(callId) || {};
      toolCallStateRef.current.set(callId, {
        ...existing,
        name: event.item.name || existing.name,
        args: event.item.arguments || existing.args || ''
      });
      return;
    }

    if (event.type === 'response.function_call_arguments.done') {
      const callId = event.call_id || event.item_id;
      if (!callId) return;
      const existing = toolCallStateRef.current.get(callId) || {};
      const argsRaw = event.arguments ?? existing.args ?? '';
      const name = event.name || existing.name;
      toolCallStateRef.current.set(callId, { ...existing, name, args: argsRaw });
      emitToolCall(name, parseArgs(argsRaw), callId);
      return;
    }

    if (event.type === 'response.output_item.done' && event.item?.type === 'function_call') {
      const callId = event.item.call_id || event.item.id;
      const name = event.item.name;
      const args = parseArgs(event.item.arguments);
      if (callId) {
        toolCallStateRef.current.set(callId, { name, args: event.item.arguments || '' });
      }
      emitToolCall(name, args, callId);
    }
  }, [emitToolCall, handlers]);

  const startSession = useCallback(async () => {
    if (isConnecting || isSessionActive) return;
    if (!restaurantId) {
      console.error('Realtime error: Missing restaurantId');
      return;
    }

    try {
      setIsConnecting(true);
      // 1. Get Ephemeral Token
      const sessionResponse = await fetch(`${API_URL}/api/session?restaurantId=${restaurantId}`, { method: 'POST' });
      const data = await sessionResponse.json();

      if (!sessionResponse.ok) throw new Error(data.error || 'Failed to initialize session');

      const EPHEMERAL_KEY = data.client_secret?.value;
      if (!EPHEMERAL_KEY) throw new Error('No ephemeral key received');

      // 2. Peer Connection
      const pc = new RTCPeerConnection();
      peerConnection.current = pc;

      // 3. Audio Output
      const el = document.createElement('audio');
      el.autoplay = true;
      el.style.display = 'none';
      document.body.appendChild(el);
      audioElRef.current = el;

      pc.ontrack = (e) => { el.srcObject = e.streams[0]; };

      // 4. Audio Input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.current = stream;
      pc.addTrack(stream.getTracks()[0]);

      // 5. Data Channel
      const dc = pc.createDataChannel('oai-events');
      dataChannel.current = dc;
      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          onRealtimeEvent(event);
        } catch {
          // Ignore malformed frames but keep session alive.
        }
      };

      // 6. SDP
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-realtime-1.5`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });

      await pc.setRemoteDescription({ type: 'answer', sdp: await sdpResponse.text() });

      setIsSessionActive(true);
      setIsConnecting(false);
    } catch (err) {
      setIsConnecting(false);
      console.error('Realtime error:', err);
      stopSession();
    }
  }, [isSessionActive, isConnecting, restaurantId, onRealtimeEvent, stopSession]);

  const sendEvent = useCallback((event) => {
    if (dataChannel.current && dataChannel.current.readyState === 'open') {
      dataChannel.current.send(JSON.stringify(event));
    }
  }, []);

  const handleToggleSession = useCallback(() => {
    if (isSessionActive) {
      stopSession();
      return;
    }
    startSession();
  }, [isSessionActive, startSession, stopSession]);

  return { isSessionActive, isConnecting, handleToggleSession, stopSession, analyzer, sendEvent };
};

export default useRealtime;
