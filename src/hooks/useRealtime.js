import { useState, useRef, useCallback } from 'react';
import { API_URL } from '../config';

const useRealtime = (restaurantId, _tableNumber, handlers = {}, currentCart = [], restaurantName = 'Cyber Chef') => {
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

  const [error, setError] = useState(null);

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

    const result = handlersRef.current.onToolCall?.({ name, args, callId });

    if (callId) {
      handledToolCallsRef.current.add(callId);

      // Send tool output back to OpenAI via Data Channel
      if (dataChannel.current && dataChannel.current.readyState === 'open') {
        const outputEvent = {
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify(result || { success: true })
          }
        };
        dataChannel.current.send(JSON.stringify(outputEvent));

        // Trigger a new response from the model to confirm the action
        dataChannel.current.send(JSON.stringify({ 
          type: 'response.create',
          response: {
            instructions: "Verbalize the action you just took based on the tool result. If you just opened the checkout form (confirm_order), you MUST tell the user to fill their details and click 'Finalize & Book Order' to finish. Never say the order is already confirmed at this stage."
          }
        }));
      }
    }
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

    if (event.type === 'response.created') {
      handlersRef.current.onProcessingStart?.();
    }

    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      handlersRef.current.onUserTranscript?.(event.transcript);
    }

    if (event.type === 'response.audio_transcription.completed') {
      handlersRef.current.onAiTranscript?.(event.transcript);
    }

    if (event.type === 'response.done') {
      handlersRef.current.onProcessingEnd?.();
    }

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
      setError(null);
      // 1. Get Ephemeral Token
      const sessionResponse = await fetch(`${API_URL}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, cart: currentCart })
      });
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
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          throw new Error('mic_denied');
        }
        throw e;
      }
      audioStream.current = stream;
      pc.addTrack(stream.getTracks()[0]);

      // 5. Data Channel
      const dc = pc.createDataChannel('oai-events');
      dataChannel.current = dc;
      
      dc.onopen = () => {
        console.log("✅ Data Channel Open - Triggering Greeting");
        // Send a message to the AI to start the conversation
        const greetingEvent = {
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: 'Hi! I am ready to order.'
              }
            ]
          }
        };
        dc.send(JSON.stringify(greetingEvent));
        
        // Force response
        dc.send(JSON.stringify({ 
          type: 'response.create',
          response: {
            instructions: `The user just joined. Greet them warmly in Hinglish as Robo, the neural concierge of ${restaurantName}. Ask what they would like to have from the menu. Keep it short and friendly.`
          }
        }));
      };

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
      setError(err.message);
      stopSession();
    }
  }, [isSessionActive, isConnecting, restaurantId, onRealtimeEvent, stopSession, currentCart, restaurantName]);

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

  return { isSessionActive, isConnecting, handleToggleSession, stopSession, analyzer, sendEvent, error, setError };
};

export default useRealtime;
