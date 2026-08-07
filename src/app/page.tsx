"use client";

import { useState, useCallback } from "react";
import { ImmersiveHero } from "@/components/fitness/immersive-hero";
import { StatsOverview } from "@/components/fitness/stats-overview";
import { MethodShowcase } from "@/components/fitness/method-showcase";
import { DayCalendar } from "@/components/fitness/day-calendar";
import { SessionPlayer } from "@/components/fitness/session-player";
import { ResourcesSection } from "@/components/fitness/resources-section";
import { SiteFooter } from "@/components/fitness/site-footer";
import { AudioProvider } from "@/components/fitness/audio-provider";
import { FloatingAudioControls } from "@/components/fitness/floating-audio-controls";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { getDay, TOTAL_DAYS } from "@/lib/program-data";
import { useToast } from "@/hooks/use-toast";
import { useProgression } from "@/hooks/use-progression";

export default function Home() {
  // Stockage local robuste (localStorage + sync serveur best-effort)
  const {
    completedDays,
    stats,
    completeDay,
    nextDay,
    isCompleted,
    isUnlocked,
  } = useProgression();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [sessionNonce, setSessionNonce] = useState(0);
  const { toast } = useToast();

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
    await completeDay(selectedDay);

    // Message adaptatif : félicitations + incitation à passer au jour suivant
    const isLastDay = selectedDay === TOTAL_DAYS;
    const tomorrow = selectedDay + 1;
    const tomorrowUnlocked = isUnlocked(tomorrow);

    toast({
      title: `Jour ${selectedDay} validé ! 🎉`,
      description: isLastDay
        ? "🏆 Tu as terminé les 30 jours ! Bravo pour cette transformation incroyable."
        : tomorrowUnlocked
          ? `Jour ${tomorrow} débloqué ! Reviens demain pour continuer ton parcours.`
          : "Félicitations ! Ta progression est enregistrée.",
    });
  }, [selectedDay, completeDay, isUnlocked, toast]);

  const dayProgram = selectedDay ? getDay(selectedDay) : null;

  return (
    <AudioProvider>
      <div className="flex min-h-screen flex-col">
        <FloatingAudioControls />
        <PWAInstallPrompt />
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

        <DayCalendar completedDays={completedDays} onSelectDay={handleSelectDay} />

        <ResourcesSection />

        <SiteFooter />

        <SessionPlayer
          key={`${selectedDay ?? "none"}-${sessionNonce}`}
          day={dayProgram}
          open={playerOpen}
          alreadyCompleted={selectedDay !== null ? isCompleted(selectedDay) : false}
          onClose={handleClosePlayer}
          onComplete={handleComplete}
        />
      </div>
    </AudioProvider>
  );
}
