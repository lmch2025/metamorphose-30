"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioControls } from "@/components/fitness/audio-controls";
import { useAudioContext } from "@/components/fitness/audio-provider";

/**
 * Bouton flottant qui ouvre un panneau de réglages audio.
 * Reste accessible sur toute la page (hero, calendrier, etc.).
 * Persistant en haut à droite.
 */
export function FloatingAudioControls() {
  const audio = useAudioContext();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bouton flottant */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed right-3 top-3 z-40 sm:right-4 sm:top-4"
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setOpen((o) => !o)}
          className="glass-strong h-10 w-10 rounded-full border-white/10 text-foreground shadow-lg hover:scale-105 transition-transform"
          aria-label="Réglages audio"
          aria-expanded={open}
        >
          <Settings2 className="h-4 w-4" />
          {/* Indicateur actif */}
          {(audio.settings.voiceEnabled || audio.settings.soundsEnabled) && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
          )}
        </Button>
      </motion.div>

      {/* Panneau déroulant */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile) */}
            <div
              className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[1px] sm:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-strong fixed right-3 top-16 z-50 w-64 rounded-2xl border border-white/10 p-4 shadow-2xl sm:right-4 sm:top-20"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Expérience audio
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="h-7 w-7 text-muted-foreground hover:bg-white/10"
                  aria-label="Fermer"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <p className="mb-3 text-xs text-muted-foreground">
                Voix et sons pour t'accompagner pendant les séances.
              </p>

              <div className="space-y-3">
                {/* Ligne voix */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={audio.toggleVoice}
                      className={`h-9 w-9 ${
                        audio.settings.voiceEnabled
                          ? "text-amber-300 hover:bg-amber-500/15"
                          : "text-muted-foreground hover:bg-white/10"
                      }`}
                      aria-pressed={audio.settings.voiceEnabled}
                    >
                      {audio.settings.voiceEnabled ? "🎙️" : "🔇"}
                    </Button>
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        Voix du coach
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {audio.settings.voiceEnabled ? "Activée" : "Désactivée"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ligne sons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        audio.toggleSounds();
                        if (!audio.settings.soundsEnabled) {
                          setTimeout(() => audio.play("chime-go"), 50);
                        }
                      }}
                      className={`h-9 w-9 ${
                        audio.settings.soundsEnabled
                          ? "text-emerald-300 hover:bg-emerald-500/15"
                          : "text-muted-foreground hover:bg-white/10"
                      }`}
                      aria-pressed={audio.settings.soundsEnabled}
                    >
                      {audio.settings.soundsEnabled ? "🔊" : "🔈"}
                    </Button>
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        Effets sonores
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {audio.settings.soundsEnabled ? "Activés" : "Désactivés"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Volume */}
                <div className="pt-1">
                  <AudioControls audio={audio} />
                </div>

                <div className="border-t border-white/5 pt-2 text-[10px] text-muted-foreground">
                  💡 Les réglages sont sauvegardés automatiquement.
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
