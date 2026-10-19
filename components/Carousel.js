"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";

const AUTOPLAY_MS = 5500;

/**
 * Full-screen hero slider -- this *is* the homepage hero (see app/page.js),
 * not a boxed section below it. Cinema-reel / coverflow look: the active
 * photo is a large square card popped to the front and center; the
 * previous/next photos sit behind and to each side, scaled down and
 * dimmed, with a real, clearly visible chunk of each showing (not a thin
 * sliver). Only the active slide plus its two immediate neighbors are
 * rendered -- anything further away just isn't in the DOM, so there's
 * nothing stray to peek through.
 *
 * Each card is square (`.hero-slide` in app/globals.css) to match the
 * real photos' actual ~1:1 aspect ratio -- not stretched into a tall
 * rectangle. The peek offset is a plain CSS custom property set in
 * globals.css (not a Tailwind arbitrary-property class -- that syntax
 * didn't reliably generate and produced a single full-bleed image with
 * no visible peek at all), read here via var() in an inline transform.
 *
 * Left/right arrows only fade in on hover; there's deliberately no
 * dot/indicator bar. This is also one of the few spots on the site that
 * uses real transform motion (translate + scale), not just opacity --
 * the hero is where a bit more movement reads as polish rather than the
 * "AI template" look the rest of the site deliberately avoids (see the
 * motion note in app/globals.css).
 *
 * `children` renders as the overlaid hero copy (logo/heading/CTA), on a
 * dark gradient scrim over the dark backdrop so it stays legible.
 */
export default function Carousel({ images, children }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const count = images.length;

  const goTo = useCallback(
    (i) => {
      if (!count) return;
      setIndex(((i % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [index, paused, count, goTo]);

  if (!count) return null;

  return (
    <section
      className="group relative w-full h-[92vh] min-h-[560px] max-h-[820px] overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full h-full">
        {images.map((src, i) => {
          // Shortest signed distance from the active slide, wrapping
          // around (so slide 0's "previous" peek is the last slide).
          let diff = i - index;
          if (diff > count / 2) diff -= count;
          if (diff < -count / 2) diff += count;

          if (Math.abs(diff) > 1) return null;

          const isActive = diff === 0;

          return (
            <div
              key={src}
              aria-hidden={!isActive}
              className="hero-slide absolute top-1/2 left-1/2 rounded-sm overflow-hidden shadow-2xl shadow-black/50 transition-[transform,opacity] duration-700 ease-out"
              style={{
                transform: `translate(calc(-50% + (${diff} * var(--peek-offset))), -50%) scale(${isActive ? 1 : 0.82})`,
                opacity: isActive ? 1 : 0.55,
                zIndex: isActive ? 2 : 1,
                pointerEvents: "none",
              }}
            >
              <Image
                src={src}
                alt={`Cosmos Scents ${i + 1}`}
                fill
                priority={i === 0}
                sizes="60vw"
                className="object-cover"
              />
            </div>
          );
        })}
      </div>

      {/* Dark scrim -- the one place the site leans into black, so the
          hero copy merges with the photography instead of sitting on a
          white band above it (see the component note above). */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-t from-ink/90 via-ink/35 to-ink/15 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-14 sm:pb-16 gap-5 text-paper">
        {children}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 text-paper/90 hover:text-gold transition-opacity text-3xl leading-none cursor-pointer"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 text-paper/90 hover:text-gold transition-opacity text-3xl leading-none cursor-pointer"
          >
            &rsaquo;
          </button>
        </>
      ) : null}
    </section>
  );
}
