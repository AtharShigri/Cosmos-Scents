import Image from "next/image";

export default function Logo({ className = "", size = "md" }) {
  const sizes = {
    sm: {
      text: "text-xl sm:text-2xl",
      gap: "gap-2.5",
      img: 50,
      imgClass: "w-[38px] h-[38px] sm:w-[42px] sm:h-[42px]",
    },
    md: {
      text: "text-2xl sm:text-3xl",
      gap: "gap-3",
      img: 66,
      imgClass: "w-[46px] h-[46px] sm:w-[56px] sm:h-[56px]",
    },
    lg: {
      text: "text-3xl sm:text-4xl lg:text-5xl",
      gap: "gap-4",
      img: 82,
      imgClass: "w-[60px] h-[60px] sm:w-[72px] sm:h-[72px]",
    },
  };

  const current = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center font-heading ${current.text} ${current.gap} ${className}`}
    >
      <span
        className={`relative rounded-full overflow-hidden border border-gold/50 shadow-sm flex-shrink-0 bg-ink ${current.imgClass}`}
      >
        <Image
          src="/brand/logo_cropped.jpeg"
          alt="Cosmos Scents Logo"
          width={current.img}
          height={current.img}
          className="w-full h-full object-cover rounded-full"
          priority
        />
      </span>
      <span className="tracking-tight text-ink font-semibold leading-none">
        Cosmos Scents
      </span>
    </span>
  );
}
