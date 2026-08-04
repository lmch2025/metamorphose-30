"use client";

import { Volume2, VolumeX, Mic, MicOff, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { UseAudioReturn } from "@/hooks/use-audio";

interface AudioControlsProps {
  audio: UseAudioReturn;
  className?: string;
  /** Compact = juste les 2 boutons toggle (pour la barre du lecteur). */
  compact?: boolean;
}

export function AudioControls({
  audio,
  className,
  compact = false,
}: AudioControlsProps) {
  const { settings, toggleSounds, toggleVoice, setVolume, play } = audio;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex items-center gap-1.5",
          compact ? "" : "flex-wrap",
          className,
        )}
      >
        {/* Bouton voix */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                toggleVoice();
                if (!settings.voiceEnabled) play("ui-click");
              }}
              className={cn(
                "h-9 w-9 transition-colors",
                settings.voiceEnabled
                  ? "text-amber-300 hover:bg-amber-500/15"
                  : "text-muted-foreground hover:bg-white/10",
              )}
              aria-label={
                settings.voiceEnabled
                  ? "Désactiver la voix"
                  : "Activer la voix"
              }
              aria-pressed={settings.voiceEnabled}
            >
              {settings.voiceEnabled ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Voix : {settings.voiceEnabled ? "activée" : "désactivée"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Bouton sons */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                toggleSounds();
                if (!settings.soundsEnabled) {
                  // Si on active, on joue un son pour confirmer
                  setTimeout(() => play("chime-go"), 50);
                }
              }}
              className={cn(
                "h-9 w-9 transition-colors",
                settings.soundsEnabled
                  ? "text-emerald-300 hover:bg-emerald-500/15"
                  : "text-muted-foreground hover:bg-white/10",
              )}
              aria-label={
                settings.soundsEnabled
                  ? "Désactiver les sons"
                  : "Activer les sons"
              }
              aria-pressed={settings.soundsEnabled}
            >
              {settings.soundsEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sons : {settings.soundsEnabled ? "activés" : "désactivés"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Volume (masqué en compact) */}
        {!compact && (
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5">
            <AudioLines className="h-3.5 w-3.5 text-muted-foreground" />
            <Slider
              value={[settings.volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={(v) => setVolume(v[0] ?? 0)}
              className="w-20"
              aria-label="Volume"
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
