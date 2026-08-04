"use client";

import { motion } from "framer-motion";
import { Clock, Flame, Trophy, Calendar, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  completedCount: number;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

function ProgressRing({
  value,
  size = 140,
  stroke = 10,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.72 0.17 155)" />
            <stop offset="50%" stopColor="oklch(0.78 0.15 75)" />
            <stop offset="100%" stopColor="oklch(0.65 0.22 15)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(1 0 0 / 0.06)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{value}%</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          parcours
        </span>
      </div>
    </div>
  );
}

export function StatsOverview({
  completedCount,
  totalSessions,
  totalMinutes,
  currentStreak,
  longestStreak,
}: StatsOverviewProps) {
  const pct = Math.round((completedCount / 30) * 100);

  const stats = [
    {
      key: "duration",
      icon: Clock,
      label: "5 min",
      sub: "par jour",
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
    },
    {
      key: "program",
      icon: Calendar,
      label: "30 jours",
      sub: "de programme",
      color: "text-amber-300",
      bg: "bg-amber-500/10",
    },
    {
      key: "streak",
      icon: TrendingUp,
      label: `${currentStreak}`,
      sub: "série actuelle",
      color: "text-orange-300",
      bg: "bg-orange-500/10",
    },
    {
      key: "record",
      icon: Trophy,
      label: `${longestStreak}`,
      sub: "record",
      color: "text-rose-300",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <section className="relative w-full px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="glass-strong rounded-3xl p-6 sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
            {/* Ring de progression */}
            <div className="flex flex-col items-center gap-3">
              <ProgressRing value={pct} />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {completedCount} / 30
                </div>
                <div className="text-xs text-muted-foreground">
                  séances complétées
                </div>
              </div>
            </div>

            {/* Grille de stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.key}
                  initial={{ y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center gap-2 rounded-2xl glass p-4 text-center"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${s.color}`}>
                    {s.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.sub}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {totalMinutes > 0 && (
            <motion.div
              initial={false}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex items-center justify-center gap-2 border-t border-white/5 pt-6 text-center"
            >
              <Flame className="h-4 w-4 text-orange-400" />
              <p className="text-sm text-muted-foreground">
                Tu as déjà investi{" "}
                <span className="font-semibold text-foreground">
                  {totalMinutes} minutes
                </span>{" "}
                dans ta transformation. Chaque minute compte.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
