"use client";

import dynamic from "next/dynamic";
import { useState, type ComponentType } from "react";
import { Loader2, Box } from "lucide-react";

interface DynamicModelProps {
  exerciseId: string;
  className?: string;
  autoRotate?: boolean;
}

// Chargement dynamique côté client uniquement (ssr: false) :
// - Évite tout mismatch d'hydration (three.js utilise window/WebGL)
// - Réduit le bundle JS initial (three.js ne se charge que quand l'utilisateur ouvre le mode 3D)
const ExerciseModel3DInner = dynamic(
  () =>
    import("@/components/fitness/exercise-model-3d").then(
      (m) => m.ExerciseModel3D as ComponentType<DynamicModelProps>,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-amber-300" />
          <span className="text-xs">Chargement du modèle 3D…</span>
        </div>
      </div>
    ),
  },
);

export function DynamicExerciseModel3D(props: DynamicModelProps) {
  return <ExerciseModel3DInner {...props} />;
}
