import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import BottlePlaceholder from "@/components/BottlePlaceholder";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  return { title: product ? `${product.name} | Cosmos Scents` : "Cosmos Scents" };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) notFound();

  const image = product.images?.[0];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 grid sm:grid-cols-2 gap-10">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- swapped for next/image once real photos exist and remotePatterns is configured
        <img
          src={image}
          alt={product.name}
          className="rounded-md border border-line w-full aspect-[3/4] object-cover"
        />
      ) : (
        <BottlePlaceholder className="aspect-[3/4]" label={product.name} />
      )}

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl">{product.name}</h1>
          {product.tagline ? (
            <p className="text-muted mt-1">{product.tagline}</p>
          ) : null}
        </div>

        <p className="text-xl font-medium">Rs {product.price.toLocaleString()}</p>

        <p className="text-sm leading-relaxed">{product.description}</p>

        {product.scentNotes?.length ? (
          <div className="flex flex-wrap gap-2">
            {product.scentNotes.map((note) => (
              <span
                key={note}
                className="text-xs font-medium border border-line text-muted px-2 py-1 rounded-sm"
              >
                {note}
              </span>
            ))}
          </div>
        ) : null}

        <p className="text-sm text-muted">{product.size}</p>

        <AddToCartButton product={product} />
      </div>
    </div>
  );
}
