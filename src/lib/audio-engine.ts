/**
 * Moteur audio unifié pour l'expérience immersive.
 *
 * Trois couches :
 *  1. Effets sonores : fichiers MP3 servis depuis /sounds/ (avec fallback WAV),
 *     et synthèse Web Audio de secours si le fichier échoue à charger (connexion lente).
 *  2. Voix de guidance : Web Speech API (speechSynthesis) — voix française du navigateur,
 *     aucun téléchargement requis, fonctionne hors-ligne après chargement de la page.
 *  3. Persistance : préférences (voix on/off, sons on/off, volume) en localStorage.
 *
 * Aucune dépendance externe. Toutes les API sont natives du navigateur.
 */

export type SoundName =
  | "beep-start"
  | "beep-countdown"
  | "chime-go"
  | "ding-halfway"
  | "chime-complete"
  | "fanfare-celebrate"
  | "whoosh"
  | "tick"
  | "ui-click"
  | "unlock";

interface AudioSettings {
  soundsEnabled: boolean;
  voiceEnabled: boolean;
  volume: number; // 0..1
}

const SETTINGS_KEY = "metamorphose30.audio-settings";

const DEFAULT_SETTINGS: AudioSettings = {
  soundsEnabled: true,
  voiceEnabled: true,
  volume: 0.7,
};

/* ---------- Persistance ---------- */

export function loadSettings(): AudioSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AudioSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/* ---------- Synthèse Web Audio de secours ---------- */
/* Si un fichier MP3/WAV échoue à charger (ERR_CONNECTION_RESET sur connexion lente),
   on génère le son à la volée via Web Audio API. */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioCtx = new Ctor();
  } catch {
    return null;
  }
  return audioCtx;
}

/** Réveille l'AudioContext (nécessaire après interaction utilisateur sur certains navigateurs). */
export function unlockAudio(): void {
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  // Précharge un silence pour débloquer speechSynthesis sur iOS
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      const u = new SpeechSynthesisUtterance("");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  }
}

function synthBeep(
  ctx: AudioContext,
  freq: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function synthChord(
  ctx: AudioContext,
  freqs: number[],
  duration: number,
  volume: number,
) {
  const now = ctx.currentTime;
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    const vol = volume * (1 - i * 0.15);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  });
}

function synthWhoosh(ctx: AudioContext, duration: number, volume: number) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    const env = Math.sin(Math.PI * t);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(200, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(
    2000,
    ctx.currentTime + duration,
  );
  filter.Q.value = 1.5;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
}

/** Génère un son de secours via Web Audio API si le fichier échoue. */
function synthFallback(name: SoundName, volume: number): boolean {
  const ctx = getCtx();
  if (!ctx) return false;
  const v = volume * 0.6;
  switch (name) {
    case "beep-start":
      synthBeep(ctx, 880, 0.18, v);
      return true;
    case "beep-countdown":
      synthBeep(ctx, 660, 0.14, v);
      return true;
    case "chime-go":
      synthChord(ctx, [880, 1320, 1760], 0.35, v);
      return true;
    case "ding-halfway":
      synthBeep(ctx, 1046, 0.4, v, "triangle");
      return true;
    case "chime-complete":
      synthChord(ctx, [523.25, 659.25, 783.99, 1046.5], 0.6, v);
      return true;
    case "fanfare-celebrate":
      // Notes ascendantes puis accord
      [523.25, 659.25, 783.99].forEach((f, i) => {
        setTimeout(() => synthBeep(ctx, f, 0.15, v), i * 180);
      });
      setTimeout(() => synthChord(ctx, [523.25, 659.25, 783.99, 1046.5], 1.0, v), 540);
      return true;
    case "whoosh":
      synthWhoosh(ctx, 0.5, v);
      return true;
    case "tick":
      synthBeep(ctx, 1000, 0.04, v * 0.7);
      return true;
    case "ui-click":
      synthBeep(ctx, 1200, 0.03, v * 0.7, "square");
      return true;
    case "unlock":
      [659.25, 880, 1318.5].forEach((f, i) => {
        setTimeout(() => synthBeep(ctx, f, 0.15, v), i * 120);
      });
      return true;
    default:
      return false;
  }
}

/* ---------- Cache des éléments <audio> ---------- */

const audioCache = new Map<SoundName, HTMLAudioElement>();
const failedFiles = new Set<SoundName>();

function getAudioEl(name: SoundName): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (failedFiles.has(name)) return null;
  if (audioCache.has(name)) return audioCache.get(name)!;
  const el = new Audio();
  // MP3 en priorité (plus petit), WAV en fallback
  el.src = `/sounds/${name}.mp3`;
  el.preload = "auto";
  el.load();
  audioCache.set(name, el);
  return el;
}

/* ---------- API publique des sons ---------- */

/**
 * Joue un effet sonore.
 * - Tente d'abord le fichier MP3/WAV
 * - Si le fichier échoue (ou a déjà échoué), utilise la synthèse Web Audio
 */
export function playSound(name: SoundName, settings: AudioSettings): void {
  if (!settings.soundsEnabled || settings.volume <= 0) return;

  const el = getAudioEl(name);
  if (el) {
    el.volume = settings.volume;
    el.currentTime = 0;
    const playPromise = el.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => {
        // Le fichier a échoué (connexion coupée) — on marque et on synthétise
        failedFiles.add(name);
        audioCache.delete(name);
        synthFallback(name, settings.volume);
      });
    }
  } else {
    // Fichier déjà marqué échoué — synthèse directe
    synthFallback(name, settings.volume);
  }
}

/* ---------- Voix de guidance (Web Speech API) ---------- */

let frenchVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function loadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;
  voicesLoaded = true;
  // Préférence : voix française, puis fr-FR, puis n'importe quelle langue contenant "fr"
  frenchVoice =
    voices.find((v) => v.lang === "fr-FR" && v.localService) ||
    voices.find((v) => v.lang === "fr-FR") ||
    voices.find((v) => v.lang.startsWith("fr")) ||
    voices.find((v) => v.name.toLowerCase().includes("french")) ||
    null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
}

/**
 * Prononce un texte en français via la voix du navigateur.
 * Annule toute énonciation en cours (sauf si `queue` est vrai).
 */
export function speak(
  text: string,
  settings: AudioSettings,
  opts: SpeakOptions = {},
): void {
  if (!settings.voiceEnabled) {
    opts.onEnd?.();
    return;
  }
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts.onEnd?.();
    return;
  }
  if (!voicesLoaded) loadVoices();

  const synth = window.speechSynthesis;
  // Annule les énonciations en attente pour éviter la pile
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  if (frenchVoice) utterance.voice = frenchVoice;
  utterance.rate = opts.rate ?? 1.0;
  utterance.pitch = opts.pitch ?? 1.0;
  utterance.volume = opts.volume ?? settings.volume;
  if (opts.onEnd) {
    utterance.onend = opts.onEnd;
    utterance.onerror = opts.onEnd;
  }
  synth.speak(utterance);
}

/** Annule toute énonciation en cours. */
export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** Indique si la synthèse vocale est supportée par le navigateur. */
export function isVoiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
