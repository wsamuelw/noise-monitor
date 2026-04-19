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
      return;
    }
    
    // Cancel any ongoing speech before starting new one (important for mobile)
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Strict priority: "Karen" (en). Provide fallback for Non-Apple platforms where Karen doesn't exist
    const selectedVoice = voices.find(voice => voice.name.includes('Karen') && voice.lang.startsWith('en'))
      || voices.find(voice => voice.name === 'Samantha') 
      || voices.find(voice => voice.name === 'Google US English' && voice.lang === 'en-US')
      || voices.find(voice => voice.name.includes('Female') && voice.lang.startsWith('en'))
      || voices.find(voice => voice.lang.startsWith('en') && voice.default);

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.1; 
    
    // iOS Safari requires a small delay sometimes
    setTimeout(() => {
      synthRef.current?.speak(utterance);
    }, 50);
  }, [voices]);

  const cancel = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
  }, []);

  return { speak, cancel, isInitialized };
};
