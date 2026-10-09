/**
 * Text wordmark placeholder for the Cosmos Scents logo.
 *
 * The client's real logo (black + gold) hasn't been delivered yet. Rather
 * than guess at a graphic mark, this renders the brand name in the heading
 * serif with a small gold mark -- clean, obviously-a-placeholder, and a
 * one-line swap for an <Image> once the real logo file exists.
 *
 * To swap in the real logo later: replace the contents of this component
 * with an <Image src="/logo.svg" ... /> (or .png). Nothing that imports
 * <Logo /> needs to change.
 */
export default function Logo({ className = "", size = "md" }) {
  const sizes = {
    sm: "text-lg gap-1.5",
    md: "text-2xl gap-2",
    lg: "text-4xl gap-2.5",
  };

  return (
    <span
      className={`inline-flex items-baseline font-heading ${sizes[size]} ${className}`}
    >
      <span className="text-gold leading-none">&#10022;</span>
      <span className="tracking-tight">Cosmos Scents</span>
    </span>
  );
}
