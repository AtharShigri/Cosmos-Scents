import fs from "fs";
import path from "path";

const CAROUSEL_DIR = path.join(process.cwd(), "public", "carousel");
const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/**
 * Reads public/carousel/ at request time and returns web paths
 * (/carousel/whatever.jpeg), sorted by the trailing number in the
 * filename (carousel-2 before carousel-10, not plain string order).
 *
 * Dropping a new carousel-N.jpg/.jpeg/.png/.webp file into that folder
 * is enough to add a slide -- no code change needed. An empty/missing
 * folder just means no carousel (Carousel.js returns null for []).
 */
export function getCarouselImages() {
  let files;
  try {
    files = fs.readdirSync(CAROUSEL_DIR);
  } catch {
    return [];
  }

  return files
    .filter((f) => VALID_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)?.[1] ?? "0", 10);
      const numB = parseInt(b.match(/(\d+)/)?.[1] ?? "0", 10);
      return numA - numB;
    })
    .map((f) => `/carousel/${f}`);
}
