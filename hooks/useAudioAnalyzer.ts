
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
      // Use getByteTimeDomainData instead of getByteFrequencyData for better mobile compatibility
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteTimeDomainData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        // Calculate RMS (Root Mean Square) for more accurate volume detection
        const value = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
        sum += value * value;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      
      // Scale RMS to 0-100 range (typical RMS values are 0-0.5 for normal speech)
      const scaledVolume = Math.min(100, (rms / 0.5) * 100);
      setVolume(scaledVolume);
    }
    animationFrameRef.current = requestAnimationFrame(analyze);
  }, []);

  const startListening = useCallback(async () => {
    if (status === AppStatus.Listening) return;
    
    stopListening(); // Clean up previous state if any
    setError(null);
    
    try {
      // Check if mediaDevices is available (requires HTTPS or localhost)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices API not available. Please use HTTPS.');
      }

      // 1. Request microphone with mobile-optimized constraints
      // iOS Safari is very strict - we must use minimal constraints
      // Some iOS versions reject streams with echoCancellation/noiseSuppression set to false
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100
        } 
      });
      streamRef.current = stream;

      // 2. Create AudioContext BEFORE connecting anything (critical for iOS)
      // Use webkitAudioContext for older iOS Safari versions
      const audioCtxConstructor = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxConstructor) {
        throw new Error('Web Audio API not supported in this browser');
      }
      const context = new audioCtxConstructor();
      audioContextRef.current = context;
      
      // 3. Setup analyser with mobile-friendly settings
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048; // Larger FFT size for better accuracy
      analyser.smoothingTimeConstant = 0.85; // Smooth out rapid volume changes
      analyserRef.current = analyser;

      // 4. Create source from stream
      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;

      // 5. Connect source directly to analyser (no destination needed for analysis)
      source.connect(analyser);
      
      // 6. Resume context if suspended (required for iOS Safari)
      // iOS requires this to happen within a user gesture event
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
  }, [status, stopListening, analyze]);

  return { volume, status, error, startListening, stopListening };
};
