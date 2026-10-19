export const metadata = {
  title: "FAQs | Cosmos Scents",
};

// Draft answers based on what's actually built/confirmed so far (payment
// methods, Pakistan-based shipping) -- not yet reviewed by Jamil. Update
// freely once he confirms real shipping times, return policy, etc.
const FAQS = [
  {
    q: "Do you ship across Pakistan?",
    a: "Yes -- we currently take orders by cash on delivery or bank transfer, shipped from Shigar, Gilgit-Baltistan to anywhere in Pakistan.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash on delivery, or bank transfer -- you'll see both options at checkout. We don't currently accept online card payments.",
  },
  {
    q: "How long does delivery take?",
    a: "This depends on your location -- contact us on WhatsApp or phone after ordering for an estimate for your area.",
  },
  {
    q: "Can I return or exchange a product?",
    a: "Reach out to us directly (see the Contact page) if there's an issue with your order and we'll sort it out on a case-by-case basis.",
  },
  {
    q: "Are your fragrances made locally?",
    a: "Yes -- every bottle is blended and bottled in Shigar Valley, Gilgit-Baltistan, not imported or relabeled.",
  },
  {
    q: "I'd like to place a bulk or wholesale order -- who do I contact?",
    a: "Message us on WhatsApp or phone (+92 333 0685060), or reach out on Instagram or Facebook.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 flex flex-col gap-8">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl">Frequently asked questions</h1>
      </header>

      <div className="flex flex-col divide-y divide-line border-y border-line">
        {FAQS.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex items-center justify-between cursor-pointer font-medium list-none">
              {item.q}
              <span className="text-muted group-open:rotate-45 transition-transform text-lg">+</span>
            </summary>
            <p className="text-sm text-muted leading-relaxed mt-2">{item.a}</p>
          </details>
        ))}
      </div>

      <p className="text-sm text-muted text-center">
        Still have a question?{" "}
        <a href="/contact" className="text-gold hover:underline">
          Get in touch
        </a>
        .
      </p>
    </div>
  );
}
