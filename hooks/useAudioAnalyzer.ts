
import { useState, useRef, useCallback, useEffect } from 'react';
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
  const statusRef = useRef<AppStatus>(AppStatus.Idle);

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Handle iOS backgrounding: suspend AudioContext when tab is hidden, resume when visible
  useEffect(() => {
    const handleVisibility = () => {
      const ctx = audioContextRef.current;
      if (!ctx || ctx.state === 'closed') return;

      if (document.hidden) {
        if (ctx.state === 'running') ctx.suspend();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = 0;
        }
      } else if (statusRef.current === AppStatus.Listening) {
        ctx.resume().then(() => {
          if (statusRef.current === AppStatus.Listening && analyserRef.current) {
            animationFrameRef.current = requestAnimationFrame(analyzeLoop);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const analyzeLoop = useCallback(() => {
    if (!analyserRef.current) return;

    // Use Float32Array for full precision — iOS AGC compresses the signal,
    // and byte data (256 levels) loses too much detail in the quiet range
    const dataArray = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Scale RMS to 0-100.
    // iOS AGC typically compresses RMS to 0-0.15 range even for loud speech.
    // Using 0.15 as the ceiling gives better sensitivity on mobile.
    // On desktop, RMS for normal speech is ~0.05-0.2, loud speech ~0.2-0.5.
    const scaledVolume = Math.min(100, (rms / 0.15) * 100);
    setVolume(scaledVolume);

    animationFrameRef.current = requestAnimationFrame(analyzeLoop);
  }, []);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
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

  const startListening = useCallback(async () => {
    if (statusRef.current === AppStatus.Listening) return;

    stopListening();
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices API not available. Please use HTTPS.');
      }

      // Request mic. Try without processing first (gives raw audio),
      // fall back to disabling iOS processing if that fails.
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
      } catch (initialError) {
        console.warn('Raw audio request failed, falling back to default constraints:', initialError);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;

      // Create AudioContext — use webkitAudioContext for older iOS
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('Web Audio API not supported in this browser');
      }
      const context = new AudioCtx();
      audioContextRef.current = context;

      const analyser = context.createAnalyser();
      analyser.fftSize = 2048; // Larger FFT = finer frequency resolution
      analyser.smoothingTimeConstant = 0.3; // Much more responsive than 0.8
      analyserRef.current = analyser;

      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      if (context.state === 'suspended') {
        await context.resume();
      }

      setStatus(AppStatus.Listening);
      animationFrameRef.current = requestAnimationFrame(analyzeLoop);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setStatus(AppStatus.PermissionDenied);
        setError('Microphone access was denied. Please allow access in your browser settings.');
      } else if (err instanceof Error && err.name === 'NotSupportedError') {
        setStatus(AppStatus.Error);
        setError('Audio configuration not supported. Try updating your browser.');
      } else if (err instanceof Error && err.message.includes('HTTPS')) {
        setStatus(AppStatus.Error);
        setError('Microphone access requires HTTPS. Please use a secure connection.');
      } else {
        setStatus(AppStatus.Error);
        setError('Could not access the microphone. Please ensure you\'re using HTTPS and have granted permission.');
      }
    }
  }, [stopListening, analyzeLoop]);

  return { volume, status, error, startListening, stopListening };
};
