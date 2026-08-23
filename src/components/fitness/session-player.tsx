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
  Box,
  ImageIcon,
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
import { DynamicExerciseModel3D } from "@/components/fitness/dynamic-exercise-model-3d";
import { getExerciseVisual } from "@/lib/exercise-visuals";
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
  const [view3D, setView3D] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs pour suivre les annonces déjà jouées (évite les répétitions)
  const announcedIdxRef = useRef(-1);
  const announcedHalfwayRef = useRef(false);

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

    // Auto-active le mode 3D si l'exercice n'a pas d'image dédiée pertinente
    // (l'animation 3D dédiée est plus représentative que l'image générique)
    const visual = getExerciseVisual(current.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView3D(visual.prefer3D);

    // Son de transition
    if (currentIndex > 0) {
      audio.play("whoosh");
    }

    // Annonce vocale COMPLÈTE : nom, description, instructions, conseil, muscles ciblés
    const num = currentIndex + 1;
    const total = exercises.length;
    const instructionsText = current.instructions
      .map((step, i) => `Étape ${i + 1}. ${step}`)
      .join(". ");
    const announcement = [
      `Exercice ${num} sur ${total}.`,
      current.name,
      current.description,
      `Comment faire : ${instructionsText}.`,
      `Conseil du coach : ${current.tips}`,
      `Muscles ciblés : ${current.targetMuscles}`,
    ].join(" ");
    // Petit délai pour laisser le whoosh se terminer
    const timer = setTimeout(() => {
      audio.say(announcement, { rate: 1.0 });
    }, currentIndex > 0 ? 350 : 100);

    return () => clearTimeout(timer);
  }, [currentIndex, open, current, sessionComplete, exercises.length, audio]);

  // --- Intervalle de décompte ---
  // RESPONSABILITÉ UNIQUE : décrémenter timeLeft de 1 chaque seconde.
  // Aucun effet de bord, aucun setState imbriqué, aucune dépendance à `current`
  // ou `exercises` (évite de recréer l'intervalle à chaque changement d'exercice,
  // ce qui causait des race conditions et des transitions prématurées).
  useEffect(() => {
    if (!isPlaying || sessionComplete) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, sessionComplete]);

  // --- Transition entre exercices (quand timeLeft atteint 0) ---
  // Effect séparé qui réagit à timeLeft === 0 pour avancer vers l'exercice
  // suivant ou terminer la séance. Pas de setState dans un updater :
  // tout se fait au niveau de l'effect, de façon fiable et prédictible.
  //
  // Les appels setState ci-dessous sont intentionnels : l'effect réagit à un
  // changement d'état dérivé (le timer atteint 0) et déclenche une transition
  // one-shot vers l'exercice suivant. Ce n'est pas un anti-pattern en cascade
  // car la condition (timeLeft === 0) n'est vraie qu'une seule fois par exercice,
  // et le guard `transitioningRef` empêche toute double exécution.
  const transitioningRef = useRef(false);
  useEffect(() => {
    if (!isPlaying || sessionComplete || !open) return;
    if (timeLeft !== 0) {
      transitioningRef.current = false;
      return;
    }
    // Évite la double-transition (l'effect peut se déclencher deux fois
    // avant que timeLeft ne soit mis à jour à la durée du prochain exercice)
    if (transitioningRef.current) return;
    transitioningRef.current = true;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= exercises.length) {
      // Dernier exercice terminé → fanfare
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionComplete(true);
       
      setIsPlaying(false);
      setTimeout(() => audio.play("fanfare-celebrate"), 200);
      setTimeout(() => {
        audio.say(
          `Bravo ! Séance du jour ${day?.day} terminée. ${day?.quote ?? ""}`,
          { rate: 1.0 },
        );
      }, 800);
      return;
    }
    // Chime de fin + passage à l'exercice suivant
    audio.play("chime-complete");
     
    setCurrentIndex(nextIndex);
     
    setTimeLeft(exercises[nextIndex].duration);
  }, [
    timeLeft,
    isPlaying,
    sessionComplete,
    open,
    currentIndex,
    exercises,
    day,
    audio,
  ]);

  // --- Annonces audio basées sur le temps restant ---
  // Effect dédié qui réagit à chaque changement de timeLeft pour déclencher
  // les sons et la voix au bon moment. Pas d'effet de bord dans un updater.
  useEffect(() => {
    if (!isPlaying || sessionComplete || !current || timeLeft <= 0) return;

    // À 10 secondes : annonce "10 secondes"
    if (timeLeft === 10) {
      audio.say("Dix secondes.", { rate: 1.1 });
    }
    // À 3, 2, 1 : beep + voix
    else if (timeLeft === 3) {
      audio.play("beep-countdown");
      setTimeout(() => audio.say("Trois.", { rate: 1.2 }), 150);
    } else if (timeLeft === 2) {
      audio.play("beep-countdown");
      setTimeout(() => audio.say("Deux.", { rate: 1.2 }), 150);
    } else if (timeLeft === 1) {
      audio.play("beep-countdown");
      setTimeout(() => audio.say("Un.", { rate: 1.2 }), 150);
    }
    // À la moitié : ding + encouragement
    else if (
      !announcedHalfwayRef.current &&
      timeLeft === Math.floor(current.duration / 2)
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
        encouragements[Math.floor(Math.random() * encouragements.length)];
      setTimeout(() => audio.say(msg, { rate: 1.1 }), 400);
    }
  }, [timeLeft, isPlaying, sessionComplete, current, audio]);

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
            className="relative z-10 flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden glass-strong sm:h-[94dvh] sm:rounded-3xl"
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
                          transitioningRef.current = false;
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
                  /* ====== ÉCRAN EXERCICE — mobile-first, flex-col ====== */
                  /* Mobile : visuel 65% + infos 35% (scrollable) */
                  /* Desktop : grid 2 colonnes 50/50 */
                  <motion.div
                    key={`ex-${currentIndex}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-full flex-col sm:grid sm:grid-cols-2 sm:grid-rows-1"
                  >
                    {/* ----- ZONE VISUELLE (grande sur mobile : 65%) ----- */}
                    <div className="relative h-[65%] min-h-0 shrink-0 overflow-hidden sm:h-full sm:shrink">
                      {view3D ? (
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-background">
                          <DynamicExerciseModel3D
                            exerciseId={current.id}
                            className="absolute inset-0 h-full w-full"
                            autoRotate
                          />
                        </div>
                      ) : (
                        <OptimizedImage
                          name={getExerciseVisual(current.id).image}
                          alt={current.name}
                          eager
                          wrapperClassName="absolute inset-0 h-full w-full"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/20" />

                      {/* Badge catégorie */}
                      <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
                        <Badge
                          className={cn(
                            "glass border-white/15 bg-gradient-to-br text-[10px] sm:text-xs",
                            catMeta.bg,
                            catMeta.color,
                          )}
                        >
                          <catMeta.icon className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          {catMeta.label}
                        </Badge>
                      </div>

                      {/* Toggle Image / 3D — tactile-friendly */}
                      <div className="absolute right-3 top-3 z-10 flex gap-0.5 rounded-lg glass-strong p-0.5 sm:right-4 sm:top-4 sm:gap-1 sm:p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setView3D(false);
                            audio.play("ui-click");
                          }}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md transition-all sm:h-7 sm:w-7",
                            !view3D
                              ? "bg-amber-500/20 text-amber-300"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                          aria-label="Vue image"
                          aria-pressed={!view3D}
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setView3D(true);
                            audio.play("unlock");
                          }}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md transition-all sm:h-7 sm:w-7",
                            view3D
                              ? "bg-amber-500/20 text-amber-300"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                          aria-label="Vue 3D"
                          aria-pressed={view3D}
                        >
                          <Box className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Timer géant */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center sm:bottom-4">
                        <motion.div
                          key={timeLeft}
                          initial={{ scale: 0.9, opacity: 0.6 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-4xl font-bold tabular-nums text-foreground drop-shadow-lg sm:text-6xl"
                        >
                          {formatTime(timeLeft)}
                        </motion.div>
                        <div className="text-[9px] uppercase tracking-widest text-muted-foreground sm:text-[10px]">
                          {isPlaying ? "en cours" : "en pause"}
                        </div>
                      </div>

                      {/* Barre progression exercice */}
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

                    {/* ----- COLONNE INFOS (35% sur mobile, 50% sur desktop) ----- */}
                    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 sm:flex-none sm:gap-3 sm:p-4">
                      {/* Titre + méta compact */}
                      <div className="shrink-0">
                        <div className="mb-0.5 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                          Ex {currentIndex + 1}/{exercises.length} · {current.duration}s · 🎯 {current.targetMuscles}
                        </div>
                        <h3 className="text-lg font-bold leading-tight text-foreground sm:text-2xl">
                          {current.name}
                        </h3>
                        <p className="mt-1 text-[11px] text-muted-foreground sm:text-sm">
                          {current.description}
                        </p>
                      </div>

                      {/* Instructions en grille 2 colonnes (compact) */}
                      <div className="min-h-0 flex-1">
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-amber-200 sm:text-xs">
                          Comment faire
                        </div>
                        <ol className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-1.5">
                          {current.instructions.map((step, i) => (
                            <li
                              key={i}
                              className="flex gap-1.5 text-[11px] text-foreground/90 sm:text-xs"
                            >
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[9px] font-bold text-amber-300 sm:h-5 sm:w-5 sm:text-[10px]">
                                {i + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>

                        {/* Conseil */}
                        <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 sm:p-2.5">
                          <div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 sm:text-xs">
                            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            Conseil du coach
                          </div>
                          <p className="text-[11px] text-foreground/90 sm:text-xs">
                            {current.tips}
                          </p>
                        </div>

                        {/* Lien ressource externe */}
                        {resource && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:border-amber-500/30 hover:bg-amber-500/5"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                              <ExternalLink className="h-3.5 w-3.5 text-amber-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[11px] font-semibold text-foreground">
                                Voir en 3D : {resource.name}
                              </div>
                              <div className="truncate text-[10px] text-muted-foreground">
                                {resource.bestFor}
                              </div>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ====== BARRE DE CONTRÔLES (mobile-first, sur une ligne) ====== */}
            {!sessionComplete && (
              <div className="flex shrink-0 items-center justify-center gap-2 border-t border-white/5 bg-background/40 px-3 py-2 sm:gap-4 sm:px-4 sm:py-2.5">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => goTo(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="h-9 w-9 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30 sm:h-11 sm:w-11"
                  aria-label="Exercice précédent"
                >
                  <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <Button
                  size="icon"
                  onClick={handlePlayPause}
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform sm:h-14 sm:w-14"
                  aria-label={isPlaying ? "Pause" : "Lecture"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5 sm:h-6 sm:w-6" />
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
                  className="h-9 w-9 text-muted-foreground hover:bg-white/10 hover:text-foreground sm:h-11 sm:w-11"
                  aria-label="Exercice suivant"
                >
                  <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                {/* Mini-puces exercices (à droite, sur la même ligne) */}
                <div className="ml-2 flex items-center gap-1 sm:ml-4 sm:gap-1.5">
                  {exercises.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === currentIndex
                          ? "w-4 bg-amber-400 sm:w-6"
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
