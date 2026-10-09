import Logo from "@/components/Logo";
import Button from "@/components/Button";
import BottlePlaceholder from "@/components/BottlePlaceholder";

/**
 * Internal reference page -- not part of the public site. Every button,
 * card, and type size the app uses should trace back to something shown
 * here. Check this page after any design change, and before building a
 * new page, to keep styling consistent instead of drifting per-page.
 */

function Swatch({ name, varName, textOn = "text-ink" }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-16 rounded-md border border-line flex items-end p-2 ${textOn}`}
        style={{ background: `var(${varName})` }}
      >
        <span className="text-xs font-mono bg-paper-raised/80 px-1 rounded-sm">
          {varName}
        </span>
      </div>
      <p className="text-sm text-muted">{name}</p>
    </div>
  );
}

export default function StyleGuide() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 flex flex-col gap-16">
      <header className="flex flex-col gap-2">
        <Logo size="lg" />
        <p className="text-muted">
          Internal style reference -- not a public page. White/paper carries
          the weight, ink handles structure, gold is a point accent only.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl">Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Swatch name="Paper (background)" varName="--color-paper" />
          <Swatch name="Paper raised (cards)" varName="--color-paper-raised" />
          <Swatch name="Ink (text)" varName="--color-ink" textOn="text-paper" />
          <Swatch name="Muted (secondary text)" varName="--color-muted" textOn="text-paper" />
          <Swatch name="Line (borders)" varName="--color-line" />
          <Swatch name="Gold (accent only)" varName="--color-gold" textOn="text-paper" />
          <Swatch name="Gold soft (badges/fills)" varName="--color-gold-soft" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl">Type scale</h2>
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl">Heading / 5xl</h1>
          <h2 className="text-3xl">Heading / 3xl</h2>
          <h3 className="text-2xl">Heading / 2xl</h3>
          <h4 className="text-xl">Heading / xl</h4>
          <p className="text-base font-sans">
            Body text / base -- Inter, used for everything that isn&apos;t a
            heading. Keep body copy left-aligned; center only titles.
          </p>
          <p className="text-sm text-muted font-sans">
            Caption / sm, muted -- prices, metadata, helper text.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl">Buttons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Add to Cart</Button>
          <Button variant="secondary">View Details</Button>
          <Button variant="ghost">Learn more &rarr;</Button>
          <Button variant="primary" disabled>
            Sold Out
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl">Product card (placeholder art)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-xl">
          {["Desert Oud", "Skardu Rose", "Glacier Musk"].map((name) => (
            <div key={name} className="flex flex-col gap-2">
              <BottlePlaceholder className="aspect-[3/4]" label={name} />
              <p className="text-sm font-medium">{name}</p>
              <p className="text-sm text-muted">Rs 2,400</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl">Badges &amp; gold-soft fill</h2>
        <div className="flex gap-3">
          <span className="text-xs font-medium bg-gold-soft text-gold px-2 py-1 rounded-sm">
            Low stock
          </span>
          <span className="text-xs font-medium border border-line text-muted px-2 py-1 rounded-sm">
            New
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-2 border-t border-line pt-8">
        <h2 className="text-xl">Rules, restated</h2>
        <ul className="text-sm text-muted list-disc pl-5 flex flex-col gap-1">
          <li>No accent lines or stripes under headings.</li>
          <li>No gradients, no glow/shadow on hover.</li>
          <li>Gold fills a small area or none at all -- never a large block.</li>
          <li>Animation: opacity/color transitions only, no scale or bounce.</li>
          <li>Center only titles; body copy and lists stay left-aligned.</li>
        </ul>
      </section>
    </div>
  );
}
