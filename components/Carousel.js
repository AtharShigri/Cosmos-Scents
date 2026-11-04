"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";

const AUTOPLAY_MS = 6000;

export default function Carousel({ images }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const count = images?.length || 0;

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
      className="relative w-full bg-paper border-b border-line"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* =========================================================
              LEFT COLUMN: Editorial Narrative (Authentic & Human)
              ========================================================= */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            {/* Understated Editorial Overline */}
            <div className="flex items-center gap-3">
              <span className="h-px w-6 bg-gold" />
              <p className="text-[11px] sm:text-xs font-medium tracking-[0.22em] uppercase text-muted">
                Handcrafted in Gilgit-Baltistan
              </p>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading text-ink leading-[1.15] tracking-tight">
              Scents inspired by the wild peaks of the Karakoram.
            </h1>

            {/* Narrative Story */}
            <p className="text-muted text-base sm:text-lg leading-relaxed max-w-lg font-sans">
              Cosmos Scents is Gilgit-Baltistan&apos;s first local fragrance house.
              Every batch is slowly blended and bottled by hand in Shigar Valley
              — capturing native botanicals, high-altitude cedar, and warm amber in
              long-lasting artisanal Extrait De Parfum.
            </p>

            {/* Call to Action */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Button
                as={Link}
                href="/products"
                variant="primary"
                className="px-7 py-3 text-sm font-medium"
              >
                Explore The Collection
              </Button>
              <Link
                href="/about"
                className="text-sm font-medium text-ink hover:text-gold transition-colors py-2 px-1 underline underline-offset-4 decoration-line hover:decoration-gold"
              >
                Our Story &amp; Heritage &rarr;
              </Link>
            </div>

            {/* Subtle Origin Note */}
            <div className="pt-4 text-xs text-muted/80 flex items-center gap-2">
              <span className="text-gold">&#10022;</span>
              <span>Distilled &amp; bottled near Serena Shigar Fort, Skardu</span>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: Curated Gallery Exhibition Showcase
              ========================================================= */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* The Stage */}
            <div className="relative w-full max-w-[480px] lg:max-w-[540px] aspect-square rounded-lg overflow-hidden border border-line bg-paper-raised shadow-md group">
              {/* Slides */}
              {images.map((src, i) => {
                const isActive = i === index;
                return (
                  <div
                    key={src}
                    aria-hidden={!isActive}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`Cosmos Scents Bottle ${i + 1}`}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 768px) 100vw, 540px"
                      className="object-cover"
                    />
                  </div>
                );
              })}

              {/* Minimalist Floating Prev / Next Controls */}
              {count > 1 ? (
                <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => goTo(index - 1)}
                    className="pointer-events-auto w-9 h-9 rounded-full bg-paper/90 hover:bg-paper text-ink border border-line shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => goTo(index + 1)}
                    className="pointer-events-auto w-9 h-9 rounded-full bg-paper/90 hover:bg-paper text-ink border border-line shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    &rarr;
                  </button>
                </div>
              ) : null}
            </div>

            {/* Human-Curated Editorial Progress Bar Below */}
            {count > 1 ? (
              <div className="w-full max-w-[480px] lg:max-w-[540px] flex items-center justify-between pt-4 px-1 text-xs text-muted">
                <span className="font-mono text-muted/70">
                  {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>

                {/* Subtle Gallery Progress Line */}
                <div className="flex-1 mx-4 h-px bg-line relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-ink transition-all duration-500 ease-out"
                    style={{
                      width: `${((index + 1) / count) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous slide"
                    onClick={() => goTo(index - 1)}
                    className="px-1.5 py-0.5 text-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    &lsaquo;
                  </button>
                  <button
                    type="button"
                    aria-label="Next slide"
                    onClick={() => goTo(index + 1)}
                    className="px-1.5 py-0.5 text-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    &rsaquo;
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
