"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import BottlePlaceholder from "@/components/BottlePlaceholder";
import StarRating from "@/components/StarRating";

function ChevronLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default function FeaturedCarousel({ products = [] }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function checkScroll() {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  function scroll(direction) {
    if (!scrollRef.current) return;
    const distance = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  }

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group w-full">
      {/* Horizontal Slider Track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth py-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => {
          const image = product.images?.[0];

          return (
            <Link
              key={product._id}
              href={`/products/${product.slug}`}
              className="relative w-[210px] sm:w-[240px] aspect-[3/4] shrink-0 rounded-lg overflow-hidden border border-line bg-paper-raised shadow-sm hover:shadow-md transition-all group/card flex flex-col justify-end select-none"
            >
              {/* Perfume Bottle Image */}
              {image ? (
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 210px, 240px"
                  className="object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="absolute inset-0 bg-paper-raised">
                  <BottlePlaceholder className="w-full h-full" label={product.name} />
                </div>
              )}

              {/* Distinctive Readable Bottom Overlay (Name + Rating Only) */}
              <div className="relative z-10 w-full p-3.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-1 text-paper pt-8">
                <h3 className="font-heading text-sm sm:text-base font-semibold leading-tight tracking-tight text-white line-clamp-1 drop-shadow-sm group-hover/card:text-gold transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs">
                  <StarRating
                    value={product.ratingAvg > 0 ? product.ratingAvg : 5}
                    size="text-xs"
                  />
                  <span className="text-[11px] font-mono text-paper/85">
                    {product.ratingAvg > 0 ? product.ratingAvg.toFixed(1) : "5.0"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Left Navigation Arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll featured scents left"
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-paper/95 text-ink hover:bg-ink hover:text-paper border border-line shadow-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll featured scents right"
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-paper/95 text-ink hover:bg-ink hover:text-paper border border-line shadow-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
