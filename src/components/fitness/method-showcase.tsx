"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  Dumbbell,
  Clock,
  Timer,
  Target,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/fitness/optimized-image";

const pillars = [
  {
    icon: Sparkles,
    title: "Affiner le visage",
    image: "ambient-face",
    color: "from-rose-500/30 to-pink-500/30",
    accent: "text-rose-300",
    desc: "Yoga facial ciblé : fish face, lion face, élévation du menton… pour tonifier les joues et redessiner l'ovale du visage.",
    exercises: ["Fish Face", "Sourire large", "Face de lion", "Étirement cou"],
  },
  {
    icon: Flame,
    title: "Brûler du gras",
    image: "ambient-cardio",
    color: "from-amber-500/30 to-orange-500/30",
    accent: "text-amber-300",
    desc: "Cardio HIIT court et intense : jumping jacks, montées de genoux, mountain climbers… pour déclencher la dépense calorique.",
    exercises: [
      "Jumping Jacks",
      "High Knees",
      "Mountain Climbers",
      "Burpees",
    ],
  },
  {
    icon: Dumbbell,
    title: "Tonifier le corps",
    image: "ambient-tone",
    color: "from-emerald-500/30 to-teal-500/30",
    accent: "text-emerald-300",
    desc: "Renforcement au poids du corps : squats, fentes, gainage, pont fessier… pour sculpter un corps ferme et tonique.",
    exercises: ["Squat", "Fentes", "Planche", "Pont fessier"],
  },
];

const galleryImages = [
  { name: "ex-face-fish", label: "Fish Face", cat: "Visage" },
  { name: "ex-cardio-jacks", label: "Jumping Jacks", cat: "Cardio" },
  { name: "ex-tone-squat", label: "Squat", cat: "Tonification" },
  { name: "ex-face-cheek", label: "Sourire large", cat: "Visage" },
  { name: "ex-cardio-climbers", label: "Mountain Climbers", cat: "Cardio" },
  { name: "ex-tone-plank", label: "Planche", cat: "Tonification" },
  { name: "ex-tone-lunge", label: "Fentes", cat: "Tonification" },
  { name: "ex-tone-bridge", label: "Pont fessier", cat: "Tonification" },
];

const structure = [
  {
    icon: Timer,
    label: "0:00 — 0:30",
    title: "Échauffement",
    desc: "Respiration dynamique et activation",
  },
  {
    icon: Target,
    label: "0:30 — 4:30",
    title: "Circuit principal",
    desc: "6 exercices × 40 secondes",
  },
  {
    icon: Clock,
    label: "4:30 — 5:00",
    title: "Récupération",
    desc: "Étirements et respiration apaisante",
  },
];

export function MethodShowcase() {
  return (
    <section className="relative w-full px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Badge
            variant="secondary"
            className="glass mb-4 border-white/10 text-xs uppercase tracking-widest text-amber-200"
          >
            <Target className="mr-1.5 h-3.5 w-3.5" />
            La méthode
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Trois piliers,{" "}
            <span className="shimmer-text">une transformation</span>
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground text-balance">
            Chaque séance combine les trois piliers en proportions adaptées à la
            phase du programme. Le visage, le cardio et la tonification
            travaillent ensemble pour un résultat complet.
          </p>
        </motion.div>

        {/* Piliers */}
        <div className="mb-16 grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl glass"
            >
              {/* Image de fond */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <OptimizedImage
                  name={p.image}
                  alt={p.title}
                  wrapperClassName="absolute inset-0 h-full w-full"
                  className="transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${p.color} mix-blend-overlay`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                {/* Icône flottante */}
                <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl glass-strong">
                  <p.icon className={`h-6 w-6 ${p.accent}`} />
                </div>

                {/* Titre */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-foreground">
                    {p.title}
                  </h3>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-5">
                <p className="mb-4 text-sm text-muted-foreground">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.exercises.map((ex) => (
                    <span
                      key={ex}
                      className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-foreground/80"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Structure d'une séance 5 min */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="glass-strong rounded-3xl p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                Anatomie d'une séance de 5 minutes
              </h3>
              <p className="text-sm text-muted-foreground">
                Structure éprouvée pour maximiser le résultat en un minimum de
                temps
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {structure.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <s.icon className="h-5 w-5 text-amber-300" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </span>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {s.title}
                </div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
                {i < structure.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-px w-4 -translate-y-1/2 translate-x-full bg-white/10 sm:block" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Galerie d'illustrations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <div className="mb-6 flex items-center gap-2 text-center">
            <Eye className="mx-auto h-5 w-5 text-amber-300" />
          </div>
          <h3 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Illustrations ultra-réalistes pour chaque exercice
          </h3>
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-muted-foreground">
            Chaque mouvement est démontré par une illustration photoréaliste
            pour t'aider à visualiser la posture exacte à reproduire.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={img.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl"
              >
                <OptimizedImage
                  name={img.name}
                  alt={img.label}
                  wrapperClassName="absolute inset-0 h-full w-full"
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-[9px] uppercase tracking-wider text-amber-300">
                    {img.cat}
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {img.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
