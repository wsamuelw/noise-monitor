import { useRef, useCallback, useEffect, useState } from 'react';

export const useSpeechSynthesizer = () => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Check for browser support on mount
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      console.warn('Speech Synthesis not supported in this browser.');
    }

    const loadVoices = () => {
      if(synthRef.current) {
        const availableVoices = synthRef.current.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
            setIsInitialized(true);
        }
      }
    };
    
    // Voices may load asynchronously.
    if (synthRef.current) {
        loadVoices();
        // The 'voiceschanged' event is the correct way to wait for voices to load.
        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = loadVoices;
        }
    }

    // Cleanup function to cancel speech on unmount
    return () => {
      if (synthRef.current) {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }
        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = null;
        }
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !text) {
      console.warn('Speech synthesis not available or no text provided');
      return;
    }

    // Cancel any ongoing speech before starting new one (important for mobile)
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Voice selection: try platform voices first, then generic fallbacks
    const selectedVoice = voices.find(voice => voice.name.includes('Karen') && voice.lang.startsWith('en'))
      || voices.find(voice => voice.name === 'Samantha')
      || voices.find(voice => voice.name === 'Google US English' && voice.lang === 'en-US')
      || voices.find(voice => voice.name.includes('Female') && voice.lang.startsWith('en'))
      || voices.find(voice => voice.lang.startsWith('en') && voice.default)
      || voices.find(voice => voice.lang.startsWith('en'));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.05;

    // iOS Safari needs speech triggered in a user gesture context.
    // The 150ms delay lets the AudioContext fully initialise first.
    // Cancel any prior pending utterances that may have queued from earlier fires.
    const doSpeak = () => {
      try {
        const synth = synthRef.current;
        if (!synth) return;
        // iOS can queue up stale utterances — clear them
        if (synth.speaking) {
          synth.cancel();
        }
        synth.speak(utterance);
      } catch (e) {
        console.error('Speech synthesis failed:', e);
      }
    };

    // Small delay so AudioContext is fully resumed before speech fires
    setTimeout(doSpeak, 150);
  }, [voices]);

  const cancel = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
  }, []);

  return { speak, cancel, isInitialized };
};
