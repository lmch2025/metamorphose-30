"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-background/60 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold shimmer-text">Métamorphose 30</span>
          </div>

          <p className="max-w-xl text-sm text-muted-foreground text-balance">
            30 jours. 5 minutes par jour. Aucun matériel. Conçu avec passion
            pour transformer ton corps en douceur, chez toi, à ton rythme.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span>🎯 Affiner les joues</span>
            <span>🔥 Brûler du gras</span>
            <span>💪 Tonifier le corps</span>
            <span>🧘 Sans matériel</span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            Fait avec <Heart className="h-3 w-3 fill-rose-400 text-rose-400" /> ·
            Toujours consulte un médecin avant de commencer un programme
            d'exercices.
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
