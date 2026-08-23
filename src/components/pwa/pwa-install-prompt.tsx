"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Smartphone,
  Sparkles,
  Check,
  Share,
  PlusSquare,
  Heart,
  Zap,
  Trophy,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";

const DISMISS_KEY = "metamorphose30.pwa-dismissed";
const APPEAR_DELAY = 2500;

export function PWAInstallPrompt() {
  const { canInstall, isInstalled, isInstalling, platform, promptInstall } =
    usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isInstalled) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // ignore
    }
    const shouldShowForIOS = platform === "ios";
    const check = () => {
      if (shouldShowForIOS || canInstall) {
        setVisible(true);
      }
    };
    const timer = setTimeout(check, APPEAR_DELAY);
    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, platform]);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const handleInstall = useCallback(async () => {
    if (platform === "ios") return;
    const accepted = await promptInstall();
    if (accepted) {
      setInstalled(true);
      setTimeout(() => {
        setVisible(false);
        try {
          sessionStorage.setItem(DISMISS_KEY, "1");
        } catch {
          // ignore
        }
      }, 2000);
    }
  }, [platform, promptInstall]);

  if (isInstalled || installed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-background/70 backdrop-blur-xl"
            onClick={dismiss}
          />
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280, delay: 0.1 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-card to-background shadow-2xl"
          >
            <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />

            <button
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative z-10 p-6 sm:p-8">
              <div className="mb-5 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.3 }}
                  className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-xl shadow-orange-500/30"
                >
                  <Sparkles className="h-10 w-10 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-2xl bg-amber-400"
                  />
                </motion.div>

                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
                  <Download className="h-3 w-3" />
                  Application mobile
                </div>
                <h2
                  id="pwa-install-title"
                  className="text-2xl font-bold text-foreground sm:text-3xl"
                >
                  Installe Métamorphose 30
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ton coach fitness de poche. 10 minutes par jour, 30 jours pour
                  transformer ton corps.
                </p>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-2.5">
                {[
                  { icon: Zap, title: "Hors-ligne", desc: "Séances sans réseau", color: "text-amber-300" },
                  { icon: Trophy, title: "Plein écran", desc: "Expérience native", color: "text-emerald-300" },
                  { icon: Heart, title: "Suivi conservé", desc: "Progression sauvée", color: "text-rose-300" },
                  { icon: Shield, title: "Gratuit", desc: "Zéro pub, zéro abonnement", color: "text-sky-300" },
                ].map((b, i) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-2.5"
                  >
                    <b.icon className={`mt-0.5 h-4 w-4 shrink-0 ${b.color}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground">{b.title}</div>
                      <div className="text-[10px] leading-tight text-muted-foreground">{b.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {platform === "ios" ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
                      <Smartphone className="h-3.5 w-3.5" />
                      Installation en 2 étapes
                    </div>
                    <ol className="space-y-1.5 text-xs text-foreground/90">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[9px] font-bold text-amber-300">1</span>
                        <span>
                          Appuie sur <Share className="inline h-3 w-3 align-text-bottom" /> <strong>Partager</strong> dans Safari
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[9px] font-bold text-amber-300">2</span>
                        <span>
                          Choisis <PlusSquare className="inline h-3 w-3 align-text-bottom" /> <strong>Sur l'écran d'accueil</strong>
                        </span>
                      </li>
                    </ol>
                  </div>
                  <Button onClick={dismiss} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30">
                    <Check className="mr-2 h-4 w-4" />
                    J'ai compris
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <Button
                    size="lg"
                    onClick={handleInstall}
                    disabled={isInstalling || !canInstall}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-6 text-base font-semibold text-white shadow-xl shadow-orange-500/30 transition-all hover:shadow-orange-500/50 disabled:opacity-60"
                  >
                    {isInstalling ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2 h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                        />
                        Installation…
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-5 w-5 transition-transform group-hover:translate-y-0.5" />
                        Installer l'application
                      </>
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="w-full py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Plus tard
                  </button>
                </div>
              )}

              <p className="mt-4 text-center text-[10px] text-muted-foreground/60">
                Aucune donnée collectée · 100% gratuit · Fonctionne hors-ligne
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
