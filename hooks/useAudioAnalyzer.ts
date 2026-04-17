
import { useState, useRef, useCallback } from 'react';
import { AppStatus } from '../types';

export const useAudioAnalyzer = () => {
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState<AppStatus>(AppStatus.Idle);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (analyserRef.current) {
        analyserRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    setVolume(0);
    setStatus(AppStatus.Idle);
  }, []);

  const analyze = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Scale to a 0-100 range
      const scaledVolume = (average / 255) * 150; 
      setVolume(Math.min(100, scaledVolume));
    }
    animationFrameRef.current = requestAnimationFrame(analyze);
  }, []);

  const startListening = useCallback(async () => {
    if (status === AppStatus.Listening) return;
    
    stopListening(); // Clean up previous state if any
    setError(null);
    
    try {
      // 1. Request microphone BEFORE AudioContext to prevent iOS sample-rate mismatch bug.
      // Do not use advanced constraints (echoCancellation, etc.) as they break iOS Safari silently.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. iOS Hack: Force the stream to play through a muted HTML5 element.
      // Without this, iOS Safari will sometimes return an array of zeros from the analyser.
      const iOSAudioEngineHack = new Audio();
      iOSAudioEngineHack.muted = true;
      iOSAudioEngineHack.srcObject = stream;
      iOSAudioEngineHack.play().catch(e => console.warn("Background audio hack rejected by iOS, skipping...", e));
      
      // 3. Create AudioContext
      const audioCtxConstructor = window.AudioContext || (window as any).webkitAudioContext;
      const context = new audioCtxConstructor();
      audioContextRef.current = context;
      
      // 4. Setup graph
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;

      // 5. Connect source directly to analyser
      source.connect(analyser);
      
      // Bulletproof iOS Safari Hack: Connect to destination with 0 gain
      const silentGain = context.createGain();
      silentGain.gain.value = 0;
      analyser.connect(silentGain);
      silentGain.connect(context.destination);

      // 6. Finally, force resume the context (allowed after getUserMedia resolves)
      if (context.state === 'suspended') {
        await context.resume();
      }
      
      setStatus(AppStatus.Listening);
      analyze();

    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          setStatus(AppStatus.PermissionDenied);
          setError('Microphone access was denied. Please allow access in your browser settings.');
      } else {
          setStatus(AppStatus.Error);
          setError('Could not access the microphone.');
      }
    }
  }, [status, stopListening, analyze]);

  return { volume, status, error, startListening, stopListening };
};
