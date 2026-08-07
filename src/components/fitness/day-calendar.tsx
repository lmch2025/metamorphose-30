"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  Dumbbell,
  Wind,
  Check,
  Lock,
  Calendar,
} from "lucide-react";
import {
  program,
  PHASES,
  type ProgramPhase,
  type DayProgram,
  type ExerciseCategory,
} from "@/lib/program-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DayCalendarProps {
  completedDays: number[];
  onSelectDay: (day: number) => void;
}

const PHASE_STYLES: Record<
  ProgramPhase,
  {
    gradient: string;
    border: string;
    glow: string;
    text: string;
    bg: string;
  }
> = {
  Fondation: {
    gradient: "from-emerald-500 to-teal-500",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
  },
  Progression: {
    gradient: "from-amber-500 to-orange-500",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
  },
  Intensification: {
    gradient: "from-orange-500 to-rose-500",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
    text: "text-orange-300",
    bg: "bg-orange-500/10",
  },
  Maîtrise: {
    gradient: "from-rose-500 to-pink-600",
    border: "border-rose-500/30",
    glow: "shadow-rose-500/20",
    text: "text-rose-300",
    bg: "bg-rose-500/10",
  },
};

const CATEGORY_ICONS: Record<ExerciseCategory, typeof Sparkles> = {
  face: Sparkles,
  cardio: Flame,
  tone: Dumbbell,
  warmup: Wind,
  cooldown: Wind,
};

function DayCard({
  day,
  completed,
  isLocked,
  phaseStyle,
  onSelect,
}: {
  day: DayProgram;
  completed: boolean;
  isLocked: boolean;
  phaseStyle: (typeof PHASE_STYLES)[ProgramPhase];
  onSelect: () => void;
}) {
  // Détecte la catégorie dominante de la séance
  const cats = day.exercises.map((e) => e.category);
  const dominantCat = (["face", "cardio", "tone"] as ExerciseCategory[]).find(
    (c) => cats.includes(c),
  ) ?? "tone";
  const DominantIcon = CATEGORY_ICONS[dominantCat];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={isLocked}
      initial={{ scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      whileHover={!isLocked ? { scale: 1.04, y: -4 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      className={cn(
        "group relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border p-2 text-center transition-all",
        isLocked
          ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40"
          : cn(
              "glass hover:border-white/25 hover:shadow-xl",
              phaseStyle.glow,
              phaseStyle.border,
            ),
      )}
    >
      {/* Dégradé de phase au survol */}
      {!isLocked && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-10",
            phaseStyle.gradient,
          )}
        />
      )}

      {/* Badge de complétion */}
      {completed && (
        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Lock pour jours verrouillés */}
      {isLocked && (
        <div className="absolute right-1.5 top-1.5">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}

      {/* Numéro du jour */}
      <div
        className={cn(
          "text-2xl font-bold leading-none sm:text-3xl",
          completed ? phaseStyle.text : "text-foreground",
        )}
      >
        {day.day}
      </div>

      {/* Icône catégorie dominante */}
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-lg",
          phaseStyle.bg,
        )}
      >
        <DominantIcon className={cn("h-3.5 w-3.5", phaseStyle.text)} />
      </div>

      {/* Titre court — suppressHydrationWarning car les apostrophes peuvent
          être rendues différemment entre SSR et client selon les extensions */}
      <div
        suppressHydrationWarning
        className="line-clamp-2 text-[9px] font-medium leading-tight text-muted-foreground sm:text-[10px]"
      >
        {day.title}
      </div>
    </motion.button>
  );
}

export function DayCalendar({ completedDays, onSelectDay }: DayCalendarProps) {
  // Les jours se débloquent progressivement : un jour est accessible si le précédent est complété OU si c'est le jour 1
  const isUnlocked = (day: number) => {
    if (day === 1) return true;
    return completedDays.includes(day - 1);
  };

  const phases = Object.keys(PHASES) as ProgramPhase[];

  return (
    <section id="programme" className="relative w-full px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* En-tête de section */}
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Badge
            variant="secondary"
            className="glass mb-4 border-white/10 text-xs uppercase tracking-widest text-amber-200"
          >
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            Ton parcours
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            30 jours,{" "}
            <span className="shimmer-text">4 phases</span>
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground text-balance">
            Chaque jour se débloque en complétant le précédent. Construis ta
            progression étape par étape, sans brusquer ton corps.
          </p>
        </motion.div>

        {/* Phases */}
        <div className="space-y-12">
          {phases.map((phase) => {
            const days = program.filter((d) => d.phase === phase);
            const phaseInfo = PHASES[phase];
            const style = PHASE_STYLES[phase];
            const completedInPhase = days.filter((d) =>
              completedDays.includes(d.day),
            ).length;

            return (
              <motion.div
                key={phase}
                initial={{ y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6 }}
              >
                {/* Header de phase */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                        phaseInfo.gradient,
                      )}
                    >
                      <span className="text-lg font-bold text-white">
                        {days[0].day}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                        {phaseInfo.label}
                      </h3>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {phaseInfo.days} · {phaseInfo.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "glass w-fit border-white/10 text-xs",
                      style.text,
                    )}
                  >
                    {completedInPhase} / {days.length} validés
                  </Badge>
                </div>

                {/* Grille de jours */}
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3 md:grid-cols-7">
                  {days.map((day) => (
                    <DayCard
                      key={day.day}
                      day={day}
                      completed={completedDays.includes(day.day)}
                      isLocked={!isUnlocked(day.day)}
                      phaseStyle={style}
                      onSelect={() => onSelectDay(day.day)}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Légende */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-rose-300" /> Visage
          </span>
          <span className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-amber-300" /> Cardio
          </span>
          <span className="flex items-center gap-1.5">
            <Dumbbell className="h-3.5 w-3.5 text-emerald-300" /> Tonification
          </span>
          <span className="flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-sky-300" /> Échauffement/Récup
          </span>
        </motion.div>
      </div>
    </section>
  );
}
