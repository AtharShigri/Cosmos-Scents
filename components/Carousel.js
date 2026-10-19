"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";

const AUTOPLAY_MS = 5500;

/**
 * Full-screen hero slider -- this *is* the homepage hero (see app/page.js),
 * not a boxed section below it. The active slide sits centered and large,
 * with a sliver of the previous/next slide peeking in at each edge (a
 * "coverflow"-style peek, not a plain single-image crossfade). Left/right
 * arrows only fade in on hover over the hero; there is deliberately no
 * dot/indicator bar.
 *
 * The peek geometry is pure CSS: each slide is narrower than the viewport
 * (--slide-w) and shifted by --offset per step via a CSS custom property,
 * tuned per breakpoint with Tailwind's arbitrary-property syntax below --
 * no JS measurement needed. This is also one of the few spots on the site
 * that uses real transform motion (translate + scale), not just opacity --
 * the hero is where a bit more movement reads as polish rather than the
 * "AI template" look the rest of the site deliberately avoids (see the
 * motion note in app/globals.css).
 *
 * The container's own background is --color-ink (near-black) -- the one
 * place the site leans into black on purpose, so the empty space around
 * the peeking photos merges with the photography instead of showing a
 * white gap. `children` renders as the overlaid hero copy, sitting on a
 * dark gradient scrim so it stays legible over any photo.
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
      className="group relative w-full h-screen min-h-[560px] max-h-[960px] overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => {
        // Shortest signed distance from the active slide, wrapping around
        // (so slide 0's "previous" peek is the last slide, and so on).
        let diff = i - index;
        if (diff > count / 2) diff -= count;
        if (diff < -count / 2) diff += count;

        const isActive = diff === 0;
        const isNeighbor = Math.abs(diff) === 1;

        return (
          <div
            key={src}
            aria-hidden={!isActive}
            className="absolute top-0 left-1/2 h-full w-[82vw] sm:w-[70vw] [--offset:84vw] sm:[--offset:72vw] transition-[transform,opacity] duration-700 ease-out"
            style={{
              transform: `translate(calc(-50% + (${diff} * var(--offset))), 0) scale(${isActive ? 1 : 0.9})`,
              opacity: isActive ? 1 : isNeighbor ? 0.55 : 0,
              zIndex: isActive ? 2 : 1,
              pointerEvents: "none",
            }}
          >
            <Image
              src={src}
              alt={`Cosmos Scents ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(min-width: 640px) 70vw, 82vw"
              className="object-cover"
            />
          </div>
        );
      })}

      {/* Dark scrim -- the one place the site leans into black, so the
          hero copy merges with the photography instead of sitting on a
          white band above it (see the component note above). */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-t from-ink/85 via-ink/15 to-ink/10 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-16 sm:pb-20 gap-6 text-paper">
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
