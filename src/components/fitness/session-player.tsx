"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Check,
  Sparkles,
  Flame,
  Dumbbell,
  Wind,
  ExternalLink,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  type DayProgram,
  type Exercise,
  type ExerciseCategory,
} from "@/lib/program-data";
import { fitnessResources } from "@/lib/resources-data";
import { OptimizedImage } from "@/components/fitness/optimized-image";
import { useAudioContext } from "@/components/fitness/audio-provider";
import { AudioControls } from "@/components/fitness/audio-controls";
import { cn } from "@/lib/utils";

interface SessionPlayerProps {
  day: DayProgram | null;
  open: boolean;
  alreadyCompleted: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const CATEGORY_META: Record<
  ExerciseCategory,
  { icon: typeof Sparkles; label: string; color: string; bg: string }
> = {
  face: {
    icon: Sparkles,
    label: "Visage",
    color: "text-rose-300",
    bg: "from-rose-500/20 to-pink-500/20",
  },
  cardio: {
    icon: Flame,
    label: "Cardio",
    color: "text-amber-300",
    bg: "from-amber-500/20 to-orange-500/20",
  },
  tone: {
    icon: Dumbbell,
    label: "Tonification",
    color: "text-emerald-300",
    bg: "from-emerald-500/20 to-teal-500/20",
  },
  warmup: {
    icon: Wind,
    label: "Échauffement",
    color: "text-sky-300",
    bg: "from-sky-500/20 to-cyan-500/20",
  },
  cooldown: {
    icon: Wind,
    label: "Récupération",
    color: "text-violet-300",
    bg: "from-violet-500/20 to-purple-500/20",
  },
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function SessionPlayer({
  day,
  open,
  alreadyCompleted,
  onClose,
  onComplete,
}: SessionPlayerProps) {
  const audio = useAudioContext();
  // État initialisé paresseusement depuis `day` — le parent passe une `key`
  // unique à chaque ouverture de séance pour remonter ce composant à neuf,
  // ce qui évite tout setState synchrone dans un effect (recommandation React).
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(
    () => day?.exercises[0]?.duration ?? 0,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(alreadyCompleted);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs pour suivre les annonces déjà jouées (évite les répétitions)
  const announcedIdxRef = useRef(-1);
  const announcedHalfwayRef = useRef(false);
  const lastSpokenSecondRef = useRef(-1);

  const exercises = day?.exercises ?? [];
  const current = exercises[currentIndex];

  // Débloque l'AudioContext au premier montage (nécessaire sur Chrome/Safari)
  useEffect(() => {
    if (open) audio.unlock();
  }, [open, audio]);

  // Ferme avec ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && !sessionComplete) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, sessionComplete, onClose]);

  // --- Annonce vocale + son quand l'exercice change ---
  useEffect(() => {
    if (!open || !current || sessionComplete) return;
    if (announcedIdxRef.current === currentIndex) return;
    announcedIdxRef.current = currentIndex;
    announcedHalfwayRef.current = false;
    lastSpokenSecondRef.current = -1;

    // Son de transition
    if (currentIndex > 0) {
      audio.play("whoosh");
    }

    // Annonce vocale : nom de l'exercice + première instruction
    const num = currentIndex + 1;
    const total = exercises.length;
    const firstInstruction = current.instructions[0] ?? "";
    const announcement = `Exercice ${num} sur ${total}. ${current.name}. ${firstInstruction}.`;
    // Petit délai pour laisser le whoosh se terminer
    const timer = setTimeout(() => {
      audio.say(announcement, { rate: 1.05 });
    }, currentIndex > 0 ? 350 : 100);

    return () => clearTimeout(timer);
  }, [currentIndex, open, current, sessionComplete, exercises.length, audio]);

  // --- Décompte avec déclenchements audio ---
  useEffect(() => {
    if (!isPlaying || sessionComplete) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const newT = t - 1;

        // Annonces basées sur le temps restant (uniquement la première fois)
        if (current && newT > 0 && newT !== lastSpokenSecondRef.current) {
          // À 10 secondes : annonce "10 secondes"
          if (newT === 10) {
            audio.say("Dix secondes.", { rate: 1.1 });
          }
          // À 3, 2, 1 : beep + voix
          else if (newT === 3) {
            audio.play("beep-countdown");
            setTimeout(() => audio.say("Trois.", { rate: 1.2 }), 150);
          } else if (newT === 2) {
            audio.play("beep-countdown");
            setTimeout(() => audio.say("Deux.", { rate: 1.2 }), 150);
          } else if (newT === 1) {
            audio.play("beep-countdown");
            setTimeout(() => audio.say("Un.", { rate: 1.2 }), 150);
          }
          // À la moitié : ding + encouragement
          else if (
            !announcedHalfwayRef.current &&
            newT === Math.floor(current.duration / 2)
          ) {
            announcedHalfwayRef.current = true;
            audio.play("ding-halfway");
            const encouragements = [
              "Tu tiens bon, continue !",
              "Parfait, garde le rythme !",
              "Excellent, ne lâche rien !",
              "Tu gères, respire !",
              "Bravo, tu es fort(e) !",
            ];
            const msg =
              encouragements[
                Math.floor(Math.random() * encouragements.length)
              ];
            setTimeout(() => audio.say(msg, { rate: 1.1 }), 400);
          }
          lastSpokenSecondRef.current = newT;
        }

        if (newT <= 0) {
          // Fin de l'exercice courant
          setCurrentIndex((idx) => {
            const next = idx + 1;
            if (next >= exercises.length) {
              // Dernier exercice terminé → fanfare
              setSessionComplete(true);
              setIsPlaying(false);
              setTimeout(() => audio.play("fanfare-celebrate"), 200);
              setTimeout(() => {
                audio.say(
                  `Bravo ! Séance du jour ${day?.day} terminée. ${day?.quote ?? ""}`,
                  { rate: 1.0 },
                );
              }, 800);
              return idx;
            }
            // Chime de fin + transition
            audio.play("chime-complete");
            setTimeLeft(exercises[next].duration);
            return next;
          });
          return 0;
        }
        return newT;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, sessionComplete, exercises, current, audio, day]);

  // Nettoie la voix à la fermeture
  useEffect(() => {
    if (!open) {
      audio.stopVoice();
    }
  }, [open, audio]);

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= exercises.length) return;
      audio.play("ui-click");
      setCurrentIndex(idx);
      setTimeLeft(exercises[idx].duration);
    },
    [exercises, audio],
  );

  const handlePlayPause = useCallback(() => {
    audio.unlock();
    if (!isPlaying) {
      // Démarre : beep de départ si c'est le premier exercice
      if (currentIndex === 0 && timeLeft === exercises[0]?.duration) {
        audio.play("beep-start");
      }
    }
    audio.play("ui-click");
    setIsPlaying((p) => !p);
  }, [isPlaying, currentIndex, timeLeft, exercises, audio]);

  const handleComplete = () => {
    audio.play("unlock");
    onComplete();
    setMarkedComplete(true);
  };

  const totalElapsed =
    exercises.reduce((s, e, i) => (i < currentIndex ? s + e.duration : s), 0) +
    (current ? current.duration - timeLeft : 0);
  const totalDuration = exercises.reduce((s, e) => s + e.duration, 0);
  const overallPct = totalDuration
    ? Math.min(100, Math.round((totalElapsed / totalDuration) * 100))
    : 0;

  if (!open || !day || !current) return null;

  const catMeta = CATEGORY_META[current.category];
  const resource = current.resourceId
    ? fitnessResources.find((r) => r.id === current.resourceId)
    : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modale */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative z-10 flex max-h-[96svh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl glass-strong shadow-2xl"
          >
            {/* En-tête : barre de progression + fermer */}
            <div className="flex items-center gap-3 border-b border-white/5 p-3 sm:p-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge
                      variant="secondary"
                      className="glass shrink-0 border-white/10 text-[10px] uppercase tracking-wider text-amber-200"
                    >
                      Jour {day.day}
                    </Badge>
                    <span className="truncate text-sm font-semibold text-foreground">
                      {day.title}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatTime(totalElapsed)} / {formatTime(totalDuration)}
                  </span>
                </div>
                <Progress value={overallPct} className="h-1.5" />
              </div>
              <AudioControls audio={audio} compact />
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Corps : soit séance, soit écran de fin */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {sessionComplete ? (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[60svh] flex-col items-center justify-center gap-6 p-6 text-center"
                  >
                    {/* Image de célébration */}
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-2xl shadow-orange-500/40"
                      >
                        <Trophy className="h-14 w-14 text-white" />
                      </motion.div>
                      {/* Particules */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute h-2 w-2 rounded-full bg-amber-300"
                          style={{
                            top: "50%",
                            left: "50%",
                          }}
                          animate={{
                            x: [
                              0,
                              Math.cos((i / 6) * Math.PI * 2) * 80,
                            ],
                            y: [
                              0,
                              Math.sin((i / 6) * Math.PI * 2) * 80,
                            ],
                            opacity: [1, 0],
                            scale: [1, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
                        Séance terminée ! 🎉
                      </h3>
                      <p className="mx-auto max-w-md text-sm text-muted-foreground">
                        Tu viens de compléter ta séance du jour {day.day}.{" "}
                        <em>&laquo;&nbsp;{day.quote}&nbsp;&raquo;</em>
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      {markedComplete ? (
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-6 py-3 text-sm font-semibold text-emerald-300">
                          <Check className="h-4 w-4" />
                          Séance validée dans ton parcours
                        </div>
                      ) : (
                        <Button
                          size="lg"
                          onClick={handleComplete}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 px-8"
                        >
                          <Check className="mr-2 h-5 w-5" />
                          Marquer comme terminé
                        </Button>
                      )}
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => {
                          setSessionComplete(false);
                          setCurrentIndex(0);
                          setTimeLeft(exercises[0].duration);
                          announcedIdxRef.current = -1;
                          announcedHalfwayRef.current = false;
                          lastSpokenSecondRef.current = -1;
                          setIsPlaying(true);
                          audio.play("beep-start");
                        }}
                        className="glass border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Recommencer
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`ex-${currentIndex}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-0 lg:grid-cols-2"
                  >
                    {/* Colonne image + timer */}
                    <div className="relative flex flex-col">
                      <div className="relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto lg:h-full">
                        <OptimizedImage
                          name={current.image ?? "ambient-tone"}
                          alt={current.name}
                          eager
                          wrapperClassName="absolute inset-0 h-full w-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                        {/* Badge catégorie */}
                        <div className="absolute left-4 top-4">
                          <Badge
                            className={cn(
                              "glass border-white/15 bg-gradient-to-br",
                              catMeta.bg,
                              catMeta.color,
                            )}
                          >
                            <catMeta.icon className="mr-1.5 h-3.5 w-3.5" />
                            {catMeta.label}
                          </Badge>
                        </div>

                        {/* Timer géant en bas de l'image */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                          <motion.div
                            key={timeLeft}
                            initial={{ scale: 0.9, opacity: 0.6 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-5xl font-bold tabular-nums text-foreground drop-shadow-lg sm:text-6xl"
                          >
                            {formatTime(timeLeft)}
                          </motion.div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {isPlaying ? "en cours" : "en pause"}
                          </div>
                        </div>

                        {/* Barre de progression de l'exercice */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-rose-500"
                            initial={{ width: "0%" }}
                            animate={{
                              width: `${
                                current.duration > 0
                                  ? ((current.duration - timeLeft) /
                                      current.duration) *
                                    100
                                  : 0
                              }%`,
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Colonne infos */}
                    <div className="flex flex-col gap-4 p-5 sm:p-6">
                      <div>
                        <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
                          Exercice {currentIndex + 1} / {exercises.length}
                        </div>
                        <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
                          {current.name}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {current.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-md bg-white/5 px-2 py-1 text-muted-foreground">
                          {current.duration}s
                        </span>
                        <span className="rounded-md bg-white/5 px-2 py-1 text-muted-foreground">
                          🎯 {current.targetMuscles}
                        </span>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-2">
                        <div className="text-xs font-semibold uppercase tracking-widest text-amber-200">
                          Comment faire
                        </div>
                        <ol className="space-y-1.5">
                          {current.instructions.map((step, i) => (
                            <li
                              key={i}
                              className="flex gap-2.5 text-sm text-foreground/90"
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-300">
                                {i + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Conseil */}
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                          <Sparkles className="h-3 w-3" />
                          Conseil du coach
                        </div>
                        <p className="text-sm text-foreground/90">
                          {current.tips}
                        </p>
                      </div>

                      {/* Lien ressource 3D */}
                      {resource && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:border-amber-500/30 hover:bg-amber-500/5"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
                            <ExternalLink className="h-4 w-4 text-amber-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-foreground">
                              Voir en 3D : {resource.name}
                            </div>
                            <div className="truncate text-[11px] text-muted-foreground">
                              {resource.bestFor}
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Barre de contrôles */}
            {!sessionComplete && (
              <div className="border-t border-white/5 bg-background/40 p-3 sm:p-4">
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => goTo(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="h-11 w-11 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30"
                    aria-label="Exercice précédent"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={handlePlayPause}
                    className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform"
                    aria-label={isPlaying ? "Pause" : "Lecture"}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="ml-0.5 h-6 w-6" />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (currentIndex === exercises.length - 1) {
                        setSessionComplete(true);
                        setIsPlaying(false);
                        setTimeout(() => audio.play("fanfare-celebrate"), 200);
                      } else {
                        goTo(currentIndex + 1);
                      }
                    }}
                    className="h-11 w-11 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    aria-label="Exercice suivant"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Liste des exercices en mini-puces */}
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  {exercises.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === currentIndex
                          ? "w-6 bg-amber-400"
                          : i < currentIndex
                            ? "w-1.5 bg-emerald-400"
                            : "w-1.5 bg-white/15 hover:bg-white/30",
                      )}
                      aria-label={`Aller à l'exercice ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
