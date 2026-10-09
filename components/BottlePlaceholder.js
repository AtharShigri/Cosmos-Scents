/**
 * Placeholder product illustration -- a simple line-art perfume bottle.
 *
 * Used on product cards until real photography exists. Deliberately plain
 * (line art, not a rendered/stock photo) so it reads honestly as a
 * placeholder rather than implying a finished product shot. Swapping a
 * product over to a real photo later is a one-field change in the product
 * data (see lib/products -- the `image` field), not a code change here.
 */
export default function BottlePlaceholder({ className = "", label }) {
  return (
    <div
      className={`flex items-center justify-center bg-paper-raised border border-line rounded-md ${className}`}
    >
      <svg
        viewBox="0 0 120 160"
        className="h-2/3 w-auto"
        fill="none"
        aria-hidden="true"
      >
        {/* cap */}
        <rect
          x="48"
          y="10"
          width="24"
          height="16"
          rx="2"
          className="stroke-gold"
          strokeWidth="2"
        />
        {/* neck */}
        <rect
          x="54"
          y="26"
          width="12"
          height="14"
          className="stroke-ink"
          strokeWidth="2"
        />
        {/* shoulder + body */}
        <path
          d="M40 40 H80 L88 56 V140 Q88 146 82 146 H38 Q32 146 32 140 V56 Z"
          className="stroke-ink"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* label line */}
        <line
          x1="40"
          y1="92"
          x2="80"
          y2="92"
          className="stroke-gold"
          strokeWidth="1.5"
        />
      </svg>
      {label ? (
        <span className="sr-only">Placeholder image for {label}</span>
      ) : null}
    </div>
  );
}
