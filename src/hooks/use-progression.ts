"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook de progression robuste avec stockage LOCAL (localStorage).
 *
 * Architecture :
 *  - Source de vérité principale : localStorage (instantané, hors-ligne, persistant)
 *  - Sync serveur en arrière-plan : au montage, on tente de fusionner avec /api/progress
 *    (si le serveur est dispo). Le serveur devient un backup, pas une dépendance.
 *  - À chaque complétion : on écrit en local immédiatement (UX instantanée)
 *    puis on pousse au serveur en best-effort (si échec, pas grave, le local prime).
 *
 * Avantages :
 *  - L'utilisateur peut passer au jour suivant même si le serveur est down
 *  - La progression survit à un reset de base de données
 *  - Pas de latence réseau pour l'UX
 *  - Fonctionne en PWA hors-ligne
 */

const STORAGE_KEY = "metamorphose30.progress";
const STATS_KEY = "metamorphose30.stats";

export interface ProgressData {
  /** Liste des jours complétés (1-30). */
  completedDays: number[];
  /** Date ISO du dernier jour complété (pour calculer la série). */
  lastCompletedDate: string | null;
  /** Dernier jour complété. */
  lastSessionDay: number;
}

interface StatsData {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

const DEFAULT_PROGRESS: ProgressData = {
  completedDays: [],
  lastCompletedDate: null,
  lastSessionDay: 0,
};

const DEFAULT_STATS: StatsData = {
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
};

/* ---------- Helpers localStorage (sans throw) ---------- */

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota dépassé ou mode privé — on ignore silencieusement
  }
}

/* ---------- Calcul de série (streak) ---------- */

function computeStreak(completedDays: number[]): number {
  // Streak = nombre de jours consécutifs complétés à partir du jour 1
  let streak = 0;
  for (let i = 1; i <= 30; i++) {
    if (completedDays.includes(i)) streak++;
    else break;
  }
  return streak;
}

/* ---------- Hook ---------- */

export interface UseProgressionReturn {
  completedDays: number[];
  stats: StatsData;
  /** Marque un jour comme complété (écrit local + sync serveur best-effort). */
  completeDay: (day: number) => Promise<void>;
  /** Démarque un jour (utile pour "recommencer" ou reset). */
  uncompleteDay: (day: number) => Promise<void>;
  /** Réinitialise toute la progression. */
  resetProgress: () => void;
  /** Le prochain jour à faire (premier non complété). */
  nextDay: number | null;
  /** Indique si un jour est complété. */
  isCompleted: (day: number) => boolean;
  /** Indique si un jour est débloqué (jour 1 ou précédent complété). */
  isUnlocked: (day: number) => boolean;
  /** Indique si les données sont en train d'être chargées depuis le serveur. */
  isLoading: boolean;
}

export function useProgression(): UseProgressionReturn {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);
  const [lastSessionDay, setLastSessionDay] = useState(0);
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  // Charge les données locales au montage (instantané)
  useEffect(() => {
    const local = readLocal<ProgressData>(STORAGE_KEY, DEFAULT_PROGRESS);
    setCompletedDays(local.completedDays);
    setLastCompletedDate(local.lastCompletedDate);
    setLastSessionDay(local.lastSessionDay);

    const localStats = readLocal<StatsData>(STATS_KEY, DEFAULT_STATS);
    setStats(localStats);

    // Sync serveur en arrière-plan (best-effort, ne bloque pas l'UI)
    (async () => {
      try {
        const res = await fetch("/api/progress", { cache: "no-store" });
        if (!res.ok) return;
        const serverData = await res.json();
        // Fusion : on prend l'union des jours complétés (local + serveur)
        // Le local prime car c'est la source la plus récente côté utilisateur
        const serverDays: number[] = serverData.completedDays || [];
        const merged = Array.from(new Set([...local.completedDays, ...serverDays])).sort(
          (a, b) => a - b,
        );

        // Si le serveur a des jours que le local n'a pas, on les ajoute
        // (cas : l'utilisateur a complété sur un autre appareil)
        if (merged.length > local.completedDays.length) {
          setCompletedDays(merged);
          writeLocal(STORAGE_KEY, {
            completedDays: merged,
            lastCompletedDate: local.lastCompletedDate,
            lastSessionDay: Math.max(local.lastSessionDay, ...merged),
          });
        }

        // Stats : on prend le max entre local et serveur
        const serverStats = serverData.stats || {};
        const mergedStats: StatsData = {
          totalSessions: merged.length,
          totalMinutes: merged.length * 10,
          currentStreak: computeStreak(merged),
          longestStreak: Math.max(
            localStats.longestStreak,
            serverStats.longestStreak || 0,
            computeStreak(merged),
          ),
        };
        setStats(mergedStats);
        writeLocal(STATS_KEY, mergedStats);
      } catch {
        // Serveur indisponible — on continue avec les données locales
      } finally {
        setIsLoading(false);
        initializedRef.current = true;
      }
    })();
  }, []);

  /* ---------- Actions ---------- */

  const persistProgress = useCallback(
    (days: number[]) => {
      const sorted = [...days].sort((a, b) => a - b);
      const lastDay = sorted.length > 0 ? sorted[sorted.length - 1] : 0;
      const now = new Date().toISOString();

      setCompletedDays(sorted);
      setLastSessionDay(lastDay);
      setLastCompletedDate(now);

      const progress: ProgressData = {
        completedDays: sorted,
        lastCompletedDate: now,
        lastSessionDay: lastDay,
      };
      writeLocal(STORAGE_KEY, progress);

      // Recalcule les stats
      const newStats: StatsData = {
        totalSessions: sorted.length,
        totalMinutes: sorted.length * 10,
        currentStreak: computeStreak(sorted),
        longestStreak: Math.max(stats.longestStreak, computeStreak(sorted)),
      };
      setStats(newStats);
      writeLocal(STATS_KEY, newStats);
    },
    [stats.longestStreak],
  );

  const completeDay = useCallback(
    async (day: number) => {
      if (day < 1 || day > 30) return;

      // Écriture locale immédiate (UX instantanée)
      const current = readLocal<ProgressData>(STORAGE_KEY, DEFAULT_PROGRESS);
      if (current.completedDays.includes(day)) return; // déjà complété
      persistProgress([...current.completedDays, day]);

      // Sync serveur best-effort (ne bloque pas)
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day, completed: true }),
        });
      } catch {
        // Serveur indisponible — le local a déjà la donnée, c'est OK
      }
    },
    [persistProgress],
  );

  const uncompleteDay = useCallback(
    async (day: number) => {
      const current = readLocal<ProgressData>(STORAGE_KEY, DEFAULT_PROGRESS);
      persistProgress(current.completedDays.filter((d) => d !== day));

      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day, completed: false }),
        });
      } catch {
        // ignore
      }
    },
    [persistProgress],
  );

  const resetProgress = useCallback(() => {
    persistProgress([]);
  }, [persistProgress]);

  /* ---------- Selectors ---------- */

  const isCompleted = useCallback(
    (day: number) => completedDays.includes(day),
    [completedDays],
  );

  const isUnlocked = useCallback(
    (day: number) => {
      if (day === 1) return true;
      return completedDays.includes(day - 1);
    },
    [completedDays],
  );

  const nextDay = useCallback(() => {
    for (let i = 1; i <= 30; i++) {
      if (!completedDays.includes(i)) return i;
    }
    return null;
  }, [completedDays]);

  return {
    completedDays,
    stats,
    completeDay,
    uncompleteDay,
    resetProgress,
    nextDay: nextDay(),
    isCompleted,
    isUnlocked,
    isLoading,
  };
}
