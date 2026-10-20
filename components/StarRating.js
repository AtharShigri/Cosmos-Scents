/**
 * Read-only star rating display -- rounds to the nearest whole star
 * rather than rendering partial-fill slivers, consistent with the
 * site's general restraint (see the motion/visual notes in
 * app/globals.css). Used on ProductCard, the product page, and
 * review lists.
 */
export default function StarRating({ value = 0, count, size = "text-sm" }) {
  const rounded = Math.round(value);

  return (
    <span className={`inline-flex items-center gap-1 ${size}`}>
      <span className="text-gold leading-none tracking-tight" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (i < rounded ? "★" : "☆")).join("")}
      </span>
      {typeof count === "number" ? (
        <span className="text-muted">
          {value.toFixed(1)} ({count})
        </span>
      ) : null}
      <span className="sr-only">{value.toFixed(1)} out of 5 stars</span>
    </span>
  );
}
