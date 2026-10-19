"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";

const AUTOPLAY_MS = 4500;

/**
 * Homepage hero carousel. Images come from public/carousel/ -- see
 * app/page.js, which reads that folder at request time, so dropping a
 * new carousel-N.jpg/jpeg/png/webp file in there is enough; no code
 * change needed.
 *
 * Fade-only transition between slides (no slide/scale motion) -- matches
 * how the rest of the site treats motion (hover states are opacity/color
 * transitions only, see app/globals.css).
 */
export default function Carousel({ images }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback(
    (i) => {
      if (!images.length) return;
      setIndex(((i % images.length) + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (paused || images.length <= 1) return;
    timerRef.current = setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [index, paused, images.length, goTo]);

  if (!images.length) return null;

  return (
    <div
      className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-md border border-line bg-paper-raised"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`Cosmos Scents ${i + 1}`}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/90 hover:text-gold transition-colors text-2xl leading-none cursor-pointer"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/90 hover:text-gold transition-colors text-2xl leading-none cursor-pointer"
          >
            &rsaquo;
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 w-1.5 rounded-full transition-colors cursor-pointer ${
                  i === index ? "bg-gold" : "bg-paper/60 hover:bg-paper"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
