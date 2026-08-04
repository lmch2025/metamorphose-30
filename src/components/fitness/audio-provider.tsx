"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useAudio, type UseAudioReturn } from "@/hooks/use-audio";

const AudioContext = createContext<UseAudioReturn | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audio = useAudio();
  return (
    <AudioContext.Provider value={audio}>{children}</AudioContext.Provider>
  );
}

/** Hook pour accéder à l'audio depuis n'importe quel composant client. */
export function useAudioContext(): UseAudioReturn {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    // Fallback : ne devrait pas arriver si AudioProvider enveloppe l'app,
    // mais on retourne un objet noop pour éviter un crash en cas d'erreur.
    throw new Error("useAudioContext doit être utilisé dans un AudioProvider");
  }
  return ctx;
}
