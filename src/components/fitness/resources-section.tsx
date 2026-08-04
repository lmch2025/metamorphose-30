"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  ExternalLink,
  Video,
  Move,
  Layers,
  CheckCircle2,
  Globe,
  Sparkles,
} from "lucide-react";
import {
  fitnessResources,
  type FitnessResourceCategory,
} from "@/lib/resources-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_FILTERS: {
  value: FitnessResourceCategory | "all";
  label: string;
  icon: typeof Box;
}[] = [
  { value: "all", label: "Toutes", icon: Layers },
  { value: "3d-character", label: "Personnages 3D", icon: Box },
  { value: "animation", label: "Animations", icon: Move },
  { value: "video-demo", label: "Vidéos", icon: Video },
  { value: "pose-library", label: "Postures", icon: Sparkles },
];

const CATEGORY_STYLE: Record<FitnessResourceCategory, { color: string; bg: string }> = {
  "3d-character": { color: "text-emerald-300", bg: "bg-emerald-500/10" },
  animation: { color: "text-amber-300", bg: "bg-amber-500/10" },
  "video-demo": { color: "text-orange-300", bg: "bg-orange-500/10" },
  "pose-library": { color: "text-rose-300", bg: "bg-rose-500/10" },
};

export function ResourcesSection() {
  const [filter, setFilter] = useState<FitnessResourceCategory | "all">("all");

  const filtered =
    filter === "all"
      ? fitnessResources
      : fitnessResources.filter((r) => r.category === filter);

  return (
    <section
      id="ressources"
      className="relative w-full px-4 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <Badge
            variant="secondary"
            className="glass mb-4 border-white/10 text-xs uppercase tracking-widest text-amber-200"
          >
            <Box className="mr-1.5 h-3.5 w-3.5" />
            Outils gratuits
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Ressources 3D pour{" "}
            <span className="shimmer-text">imiter les mouvements</span>
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground text-balance">
            Des outils 100% gratuits, accessibles dans ton navigateur, pour
            visualiser chaque exercice en 3D ou en vidéo et reproduire le
            mouvement à la perfection. Aucun matériel, aucun logiciel à acheter.
          </p>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap items-center justify-center gap-2"
        >
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-all",
                filter === f.value
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground",
              )}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Grille de ressources */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource, i) => {
            const style = CATEGORY_STYLE[resource.category];
            return (
              <motion.a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl glass p-5 transition-all hover:border-white/20 hover:shadow-xl"
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      style.bg,
                    )}
                  >
                    {resource.category === "3d-character" && (
                      <Box className={cn("h-5 w-5", style.color)} />
                    )}
                    {resource.category === "animation" && (
                      <Move className={cn("h-5 w-5", style.color)} />
                    )}
                    {resource.category === "video-demo" && (
                      <Video className={cn("h-5 w-5", style.color)} />
                    )}
                    {resource.category === "pose-library" && (
                      <Sparkles className={cn("h-5 w-5", style.color)} />
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>

                {/* Nom + badges */}
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {resource.name}
                </h3>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium",
                      style.bg,
                      style.color,
                    )}
                  >
                    {resource.category === "3d-character" && "Personnage 3D"}
                    {resource.category === "animation" && "Animation"}
                    {resource.category === "video-demo" && "Vidéo"}
                    {resource.category === "pose-library" && "Postures"}
                  </span>
                  {resource.free && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Gratuit
                    </span>
                  )}
                  {resource.inBrowser && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                      <Globe className="h-2.5 w-2.5" />
                      Navigateur
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mb-3 text-sm text-muted-foreground">
                  {resource.description}
                </p>

                {/* Idéal pour */}
                <div className="mt-auto rounded-lg bg-white/5 p-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                    Idéal pour
                  </div>
                  <p className="mt-0.5 text-xs text-foreground/80">
                    {resource.bestFor}
                  </p>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center text-xs text-muted-foreground"
        >
          💡 Astuce : garde un onglet ouvert sur{" "}
          <a
            href="https://www.mixamo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-300 underline-offset-4 hover:underline"
          >
            Mixamo
          </a>{" "}
          pendant tes séances pour vérifier chaque mouvement en 3D avant de le
          reproduire.
        </motion.div>
      </div>
    </section>
  );
}
