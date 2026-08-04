import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Métamorphose 30 — Transforme ton corps en 30 jours",
  description:
    "Programme de 5 minutes par jour pendant 30 jours pour perdre les joues du visage, perdre du poids et tonifier tout le corps. Animations immersives, illustrations ultra-réalistes et ressources 3D gratuites.",
  keywords: [
    "fitness",
    "30 jours",
    "perdre du poids",
    "joues du visage",
    "tonifier le corps",
    "exercices maison",
    "sans matériel",
    "5 minutes par jour",
  ],
  authors: [{ name: "Métamorphose 30" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Métamorphose 30 — Transforme ton corps en 30 jours",
    description:
      "5 minutes par jour pendant 30 jours. Perds les joues, perds du poids, tonifie tout ton corps.",
    url: "https://chat.z.ai",
    siteName: "Métamorphose 30",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Métamorphose 30",
    description: "Transforme ton corps en 30 jours, 5 minutes par jour.",
  },
};

export const viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {/* Barre de chargement visible immédiatement — cachée quand React hydrate */}
        <div id="css-loading-bar" className="css-loading-bar" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('load',function(){var b=document.getElementById('css-loading-bar');if(b){setTimeout(function(){b.classList.add('hidden');setTimeout(function(){b.remove();},500);},300);}});`,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
