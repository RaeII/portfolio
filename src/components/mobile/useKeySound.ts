import { useEffect, useRef } from 'react';
import { usePhone } from './PhoneContext';

const SOUND_URL = '/sound/sound_click.wav';
const POOL_SIZE = 4;
const PHONE_KEYPAD_SOUND_EVENT = 'phone-keypad-input';

export function useKeySound() {
  const { soundOn } = usePhone();
  const poolRef = useRef<HTMLAudioElement[]>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    poolRef.current = Array.from({ length: POOL_SIZE }, () => {
      const audio = new Audio(SOUND_URL);
      audio.preload = 'auto';
      audio.volume = 0.5;
      return audio;
    });

    return () => {
      poolRef.current.forEach(a => {
        a.pause();
        a.src = '';
      });
      poolRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!soundOn) return;

    const play = () => {
      const audio = poolRef.current[indexRef.current];
      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      indexRef.current = (indexRef.current + 1) % POOL_SIZE;
    };

    const handler = () => play();
    window.addEventListener('phone-input', handler);
    window.addEventListener(PHONE_KEYPAD_SOUND_EVENT, handler);
    return () => {
      window.removeEventListener('phone-input', handler);
      window.removeEventListener(PHONE_KEYPAD_SOUND_EVENT, handler);
    };
  }, [soundOn]);
}
