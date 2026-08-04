"use client";

import { motion } from "framer-motion";
import { ChevronDown, Sparkles, Flame, Dumbbell, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ImmersiveHeroProps {
  onStart: () => void;
  onResources: () => void;
  completedCount: number;
}

const objectives = [
  {
    icon: Sparkles,
    label: "Affiner les joues",
    color: "from-rose-400 to-pink-500",
    desc: "Yoga facial ciblé",
  },
  {
    icon: Flame,
    label: "Brûler du gras",
    color: "from-amber-400 to-orange-500",
    desc: "Cardio HIIT court",
  },
  {
    icon: Dumbbell,
    label: "Tonifier le corps",
    color: "from-emerald-400 to-teal-500",
    desc: "Renforcement complet",
  },
];

export function ImmersiveHero({
  onStart,
  onResources,
  completedCount,
}: ImmersiveHeroProps) {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center">
      {/* Image de fond avec effet Ken Burns */}
      <div className="absolute inset-0 z-0">
        { }
        <img
          src="/images/hero-immersive.jpg"
          alt="Sanctuaire de bien-être zen au lever du soleil"
          className="h-full w-full object-cover animate-ken-burns"
        />
        {/* Overlay dégradé immersif */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </div>

      {/* Orbes flottants décoratifs */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute top-[15%] left-[10%] h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-float-slow" />
        <div className="absolute bottom-[20%] right-[12%] h-96 w-96 rounded-full bg-amber-500/20 blur-3xl animate-float-medium" />
        <div className="absolute top-[40%] right-[25%] h-56 w-56 rounded-full bg-rose-500/15 blur-3xl animate-float-slow" />
        <div className="absolute bottom-[35%] left-[20%] h-64 w-64 rounded-full bg-orange-500/15 blur-3xl animate-pulse-glow" />
      </div>

      {/* Contenu central */}
      <div className="relative z-20 flex flex-col items-center px-4 py-20 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Badge
            variant="secondary"
            className="glass border-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-amber-200"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            30 jours · 5 min par jour · sans matériel
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl text-balance"
        >
          <span className="shimmer-text">Métamorphose</span>
          <br />
          <span className="text-foreground">30</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg text-balance"
        >
          Un voyage immersif de 30 jours pour{" "}
          <span className="text-rose-300">affiner ton visage</span>,{" "}
          <span className="text-amber-300">perdre du poids</span> et{" "}
          <span className="text-emerald-300">tonifier tout ton corps</span>.
          Chaque jour, 5 minutes suffisent. Illustrations ultra-réalistes et
          ressources 3D gratuites pour imiter chaque mouvement à la perfection.
        </motion.p>

        {/* Objectifs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 w-full max-w-3xl"
        >
          {objectives.map((obj) => (
            <div
              key={obj.label}
              className="glass group relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all hover:scale-[1.03] hover:border-white/20"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${obj.color} shadow-lg`}
              >
                <obj.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                {obj.label}
              </div>
              <div className="text-xs text-muted-foreground">{obj.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-12 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            onClick={onStart}
            className="group relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-[1.03] px-8 py-6 text-base font-semibold"
          >
            <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            {completedCount > 0 ? "Continuer le voyage" : "Commencer le voyage"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onResources}
            className="glass border-white/15 bg-white/5 text-foreground hover:bg-white/10 px-8 py-6 text-base font-semibold"
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            Ressources 3D gratuites
          </Button>
        </motion.div>

        {completedCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            <span className="font-semibold text-amber-300">
              {completedCount}
            </span>{" "}
            / 30 séances complétées · Continue ton élan 🔥
          </motion.div>
        )}
      </div>

      {/* Indicateur de scroll */}
      <motion.button
        onClick={onStart}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Défiler vers le bas"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-xs uppercase tracking-widest">Découvrir</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.button>
    </section>
  );
}
