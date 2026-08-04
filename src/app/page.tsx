"use client";

import { useState, useEffect, useCallback } from "react";
import { ImmersiveHero } from "@/components/fitness/immersive-hero";
import { StatsOverview } from "@/components/fitness/stats-overview";
import { MethodShowcase } from "@/components/fitness/method-showcase";
import { DayCalendar } from "@/components/fitness/day-calendar";
import { SessionPlayer } from "@/components/fitness/session-player";
import { ResourcesSection } from "@/components/fitness/resources-section";
import { SiteFooter } from "@/components/fitness/site-footer";
import { getDay } from "@/lib/program-data";
import { useToast } from "@/hooks/use-toast";

interface ProgressData {
  completedDays: number[];
  stats: {
    totalSessions: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    lastSessionDay: number;
    lastSessionDate: string | null;
  };
}

export default function Home() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDay: 0,
    lastSessionDate: null as string | null,
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [sessionNonce, setSessionNonce] = useState(0);
  const { toast } = useToast();

  // Charge la progression au montage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/progress", { cache: "no-store" });
        if (!res.ok) return;
        const data: ProgressData = await res.json();
        if (cancelled) return;
        setCompletedDays(data.completedDays);
        setStats(data.stats);
      } catch (err) {
        console.error("Erreur lors du chargement de la progression:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToProgramme = useCallback(() => {
    document.getElementById("programme")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToResources = useCallback(() => {
    document.getElementById("ressources")?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  const handleSelectDay = useCallback((day: number) => {
    setSelectedDay(day);
    setSessionNonce((n) => n + 1);
    setPlayerOpen(true);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setPlayerOpen(false);
  }, []);

  const handleComplete = useCallback(async () => {
    if (selectedDay === null) return;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: selectedDay, completed: true }),
      });
      if (!res.ok) throw new Error("Erreur API");
      const data = await res.json();
      setCompletedDays(data.completedDays);
      setStats((s) => ({
        ...s,
        totalSessions: data.totalSessions,
        totalMinutes: data.totalSessions * 5,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        lastSessionDay: data.day,
        lastSessionDate: new Date().toISOString(),
      }));
      toast({
        title: `Jour ${selectedDay} validé ! 🎉`,
        description:
          "Félicitations ! Ta progression est enregistrée. Reviens demain pour la suite.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer ta progression.",
        variant: "destructive",
      });
    }
  }, [selectedDay, toast]);

  const dayProgram = selectedDay ? getDay(selectedDay) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <ImmersiveHero
        onStart={scrollToProgramme}
        onResources={scrollToResources}
        completedCount={completedDays.length}
      />

      <StatsOverview
        completedCount={completedDays.length}
        totalSessions={stats.totalSessions}
        totalMinutes={stats.totalMinutes}
        currentStreak={stats.currentStreak}
        longestStreak={stats.longestStreak}
      />

      <MethodShowcase />

      <DayCalendar
        completedDays={completedDays}
        onSelectDay={handleSelectDay}
      />

      <ResourcesSection />

      <SiteFooter />

      <SessionPlayer
        key={`${selectedDay ?? "none"}-${sessionNonce}`}
        day={dayProgram}
        open={playerOpen}
        alreadyCompleted={
          selectedDay !== null ? completedDays.includes(selectedDay) : false
        }
        onClose={handleClosePlayer}
        onComplete={handleComplete}
      />
    </div>
  );
}
