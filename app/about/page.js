export const metadata = {
  title: "About | Cosmos Scents",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-10">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl">Our story</h1>
        <p className="text-muted">Gilgit-Baltistan&apos;s first local fragrance brand.</p>
      </header>

      <p className="text-muted leading-relaxed">
        Cosmos Scents is the first local fragrance brand from Gilgit-Baltistan.
        Born in the heart of Shigar Valley, we craft authentic, premium
        fragrances inspired by the majestic landscapes, vibrant traditions,
        and timeless elegance of Baltistan and beyond.
      </p>

      <div className="grid sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <p className="font-medium text-lg font-heading">Our mission</p>
          <p className="text-sm text-muted leading-relaxed">
            To celebrate the unique essence of Gilgit-Baltistan through
            exquisite fragrances, and to bring the heritage of our valleys
            to the world through premium, handcrafted products.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-medium text-lg font-heading">What we offer</p>
          <p className="text-sm text-muted leading-relaxed">
            Signature collections -- Essence de Skardu and Essence de Hunza
            -- designed to evoke the spirit and charm of our land, offering
            a sensory connection to the region&apos;s beauty and
            craftsmanship.
          </p>
        </div>
      </div>

      <div className="border-t border-line pt-8 flex flex-col gap-2">
        <p className="font-medium text-lg font-heading">Made in Shigar Valley</p>
        <p className="text-sm text-muted leading-relaxed">
          Every bottle is blended and bottled locally, near Sarina Shigar
          Fort -- not imported, not mass-produced elsewhere and relabeled.
          Cosmos Scents exists to prove that world-class fragrance can come
          from Gilgit-Baltistan itself.
        </p>
      </div>
    </div>
  );
}
