"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  type AudioSettings,
  type SoundName,
  loadSettings,
  saveSettings,
  playSound,
  speak,
  stopSpeaking,
  unlockAudio,
} from "@/lib/audio-engine";

export interface UseAudioReturn {
  settings: AudioSettings;
  toggleSounds: () => void;
  toggleVoice: () => void;
  setVolume: (v: number) => void;
  play: (name: SoundName) => void;
  say: (text: string, opts?: { rate?: number; onEnd?: () => void }) => void;
  stopVoice: () => void;
  unlock: () => void;
}

/**
 * Hook React pour gérer l'audio : préférences persistées, lecture de sons,
 * voix de guidance. À utiliser une seule fois au niveau racine de l'app.
 */
export function useAudio(): UseAudioReturn {
  // Initialise paresseusement depuis localStorage (côté client uniquement).
  // Sur le serveur, retourne les valeurs par défaut — la hydration se fait
  // sans mismatch car le AudioProvider est un composant client et ne rend
  // rien de dépendant de ces settings avant le montage côté client.
  const [settings, setSettings] = useState<AudioSettings>(() => {
    if (typeof window === "undefined") {
      return {
        soundsEnabled: true,
        voiceEnabled: true,
        volume: 0.7,
      };
    }
    return loadSettings();
  });
  const settingsRef = useRef(settings);

  // Tient le ref à jour dans un effect (pas pendant le rendu)
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Sauvegarde à chaque changement
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const toggleSounds = useCallback(() => {
    setSettings((s) => ({ ...s, soundsEnabled: !s.soundsEnabled }));
  }, []);

  const toggleVoice = useCallback(() => {
    setSettings((s) => {
      const next = { ...s, voiceEnabled: !s.voiceEnabled };
      if (!next.voiceEnabled) stopSpeaking();
      return next;
    });
  }, []);

  const setVolume = useCallback((v: number) => {
    setSettings((s) => ({ ...s, volume: Math.max(0, Math.min(1, v)) }));
  }, []);

  const play = useCallback((name: SoundName) => {
    playSound(name, settingsRef.current);
  }, []);

  const say = useCallback(
    (text: string, opts?: { rate?: number; onEnd?: () => void }) => {
      speak(text, settingsRef.current, {
        rate: opts?.rate,
        onEnd: opts?.onEnd,
      });
    },
    [],
  );

  const stopVoice = useCallback(() => stopSpeaking(), []);

  const unlock = useCallback(() => unlockAudio(), []);

  return {
    settings,
    toggleSounds,
    toggleVoice,
    setVolume,
    play,
    say,
    stopVoice,
    unlock,
  };
}
