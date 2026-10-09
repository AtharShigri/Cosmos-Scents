/**
 * Shared button styles. Three variants, used consistently everywhere
 * rather than one-off className strings per page -- this is what keeps
 * the whole build visually consistent under time pressure.
 *
 * Deliberately avoids: pill/fully-rounded shapes, drop shadows, gradients,
 * and hover states that scale/glow. Restraint is the point.
 */
const base =
  "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-ink text-paper hover:bg-ink/85",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:text-gold",
};

export default function Button({
  variant = "primary",
  className = "",
  as: Component = "button",
  ...props
}) {
  return (
    <Component
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    />
  );
}
