import { useState, useRef, useCallback } from 'react';
import { API_URL } from '../config';

const useRealtime = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [analyzer, setAnalyzer] = useState(null);
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);
  const audioStream = useRef(null);
  const audioElRef = useRef(null);

  const startSession = useCallback(async (onEvent, restaurantId) => {
    if (isConnecting || isSessionActive) return;

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
        if (onEvent) onEvent(JSON.parse(e.data));
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
  }, [isSessionActive, isConnecting]);

  const stopSession = useCallback(() => {
    if (peerConnection.current) peerConnection.current.close();
    if (audioStream.current) audioStream.current.getTracks().forEach(t => t.stop());
    if (audioElRef.current) audioElRef.current.remove();
    setIsSessionActive(false);
    setIsConnecting(false);
    setAnalyzer(null);
  }, []);

  const sendEvent = useCallback((event) => {
    if (dataChannel.current && dataChannel.current.readyState === 'open') {
      dataChannel.current.send(JSON.stringify(event));
    }
  }, []);

  return { isSessionActive, isConnecting, startSession, stopSession, analyzer, sendEvent };
};

export default useRealtime;
