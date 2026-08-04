"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { getBlur } from "@/lib/blur-data";

interface OptimizedImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  /**
   * Nom de base de l'image (sans extension), ex: "hero-immersive".
   * Le composant va chercher /images/<name>.webp en priorité et
   * /images/<name>.jpg en fallback.
   */
  name: string;
  /** Alt descriptif (obligatoire pour l'accessibilité). */
  alt: string;
  /** Lazy par défaut. Passer `false` pour le hero (above-the-fold). */
  eager?: boolean;
  /** Classes additionnelles sur l'élément <img>. */
  className?: string;
  /** Wrapper classes (le conteneur qui porte le placeholder flou). */
  wrapperClassName?: string;
}

/**
 * Image optimisée pour connexion lente :
 *  - Sert du WebP (taille réduite de ~75 % vs JPEG d'origine)
 *  - Affiche un placeholder flou (LQIP) instantanément pendant le chargement
 *  - Lazy-load par défaut (sauf `eager`)
 *  - Décodage asynchrone
 *  - Fallback JPEG si WebP non supporté (navigateurs très anciens)
 *  - Fallback gradient si l'image échoue (ERR_CONNECTION_RESET, etc.)
 */
export function OptimizedImage({
  name,
  alt,
  eager = false,
  className,
  wrapperClassName,
  ...rest
}: OptimizedImageProps) {
  const [failed, setFailed] = useState(false);
  const blur = getBlur(name);

  // Format final : on utilise <picture> pour servir WebP avec fallback JPEG
  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-emerald-500/10",
          wrapperClassName,
        )}
        aria-label={alt}
        role="img"
      >
        <div className="text-center text-xs text-muted-foreground/60">
          <div className="text-2xl">🖼️</div>
          <div className="mt-1">Image indisponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {/* Placeholder flou (LQIP) — affiché tant que l'image n'est pas chargée */}
      {blur && (
         
        <img
          src={blur}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full scale-110 object-cover blur-xl",
            "transition-opacity duration-700",
          )}
          style={{ zIndex: 0 }}
        />
      )}
      <picture>
        <source srcSet={`/images/${name}.webp`} type="image/webp" />
        <source srcSet={`/images/${name}.jpg`} type="image/jpeg" />
        { }
        <img
          src={`/images/${name}.jpg`}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
          onError={() => setFailed(true)}
          className={cn(
            "relative h-full w-full object-cover transition-opacity duration-700",
            className,
          )}
          style={{ zIndex: 1 }}
          {...rest}
        />
      </picture>
    </div>
  );
}
