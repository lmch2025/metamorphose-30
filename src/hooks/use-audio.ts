"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
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

const DEFAULT_SETTINGS: AudioSettings = {
  soundsEnabled: true,
  voiceEnabled: true,
  volume: 0.7,
};

/* ---------- Store externe pour localStorage (sans mismatch d'hydration) ---------- */
/* useSyncExternalStore retourne un snapshot cohérent entre serveur et client :
   - getServerSnapshot retourne toujours les valeurs par défaut
   - getSnapshot (client) retourne les valeurs réelles
   React sait qu'il peut y avoir une différence et gère la re-render post-hydration
   sans lever d'erreur de mismatch. */

let currentSettings: AudioSettings | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): AudioSettings {
  if (currentSettings === null) {
    currentSettings = loadSettings();
  }
  return currentSettings;
}

function getServerSnapshot(): AudioSettings {
  return DEFAULT_SETTINGS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function updateSettings(updater: (prev: AudioSettings) => AudioSettings): void {
  const next = updater(currentSettings ?? DEFAULT_SETTINGS);
  currentSettings = next;
  saveSettings(next);
  listeners.forEach((l) => l());
}

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
  // useSyncExternalStore : pas de mismatch d'hydration, pas de setState dans un effect.
  const settings = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Ref pour accéder aux settings courants dans les callbacks (sans recréer les callbacks)
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const toggleSounds = useCallback(() => {
    updateSettings((s) => ({ ...s, soundsEnabled: !s.soundsEnabled }));
  }, []);

  const toggleVoice = useCallback(() => {
    updateSettings((s) => {
      const next = { ...s, voiceEnabled: !s.voiceEnabled };
      if (!next.voiceEnabled) stopSpeaking();
      return next;
    });
  }, []);

  const setVolume = useCallback((v: number) => {
    updateSettings((s) => ({ ...s, volume: Math.max(0, Math.min(1, v)) }));
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
