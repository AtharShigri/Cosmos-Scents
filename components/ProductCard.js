import Link from "next/link";
import Image from "next/image";
import BottlePlaceholder from "@/components/BottlePlaceholder";

/**
 * Catalog/homepage product tile. Falls back to the line-art placeholder
 * until a product has real photography in `images`.
 */
export default function ProductCard({ product }) {
  const image = product.images?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-3"
    >
      {image ? (
        // 2:3 matches the real product photos' actual ratio -- a 3:4 box
        // (the old value) cropped a visible strip off every photo.
        <div className="relative aspect-[2/3] rounded-md border border-line overflow-hidden bg-paper-raised">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        </div>
      ) : (
        <BottlePlaceholder className="aspect-[2/3]" label={product.name} />
      )}
      <div className="flex flex-col gap-0.5">
        <p className="font-medium group-hover:text-gold transition-colors">
          {product.name}
        </p>
        {product.tagline ? (
          <p className="text-sm text-muted">{product.tagline}</p>
        ) : null}
        <p className="text-sm text-muted">Rs {product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
