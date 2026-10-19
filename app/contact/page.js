export const metadata = {
  title: "Contact | Cosmos Scents",
};

const SOCIALS = [
  { name: "Instagram", handle: "@cosmos_scents", href: "https://instagram.com/cosmos_scents" },
  { name: "Facebook", handle: "Cosmosscent", href: "https://www.facebook.com/Cosmosscent" },
  { name: "LinkedIn", handle: "Cosmos Scents", href: "https://www.linkedin.com/company/cosmos-scents/" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 flex flex-col gap-10">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl">Get in touch</h1>
        <p className="text-muted">
          Questions about an order, a scent, or a bulk/wholesale inquiry --
          reach us any of these ways.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-3">
          <p className="font-medium">Phone &amp; WhatsApp</p>
          <a href="tel:+923330685060" className="text-muted hover:text-gold transition-colors">
            +92 333 0685060
          </a>
          <a
            href="https://wa.me/923330685060"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gold hover:underline w-fit"
          >
            Message on WhatsApp &rarr;
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-medium">Visit us</p>
          <p className="text-muted leading-relaxed">
            Cosmos Scents
            <br />
            Near Sarina Shigar Fort
            <br />
            Shigar, Gilgit-Baltistan
          </p>
        </div>
      </div>

      <div className="border-t border-line pt-8 flex flex-col gap-3">
        <p className="font-medium">Follow us</p>
        <div className="flex flex-col gap-2 text-sm">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-gold transition-colors"
            >
              {s.name} -- {s.handle}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
