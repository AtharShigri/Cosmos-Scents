import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/Button";

/**
 * Placeholder landing section for Day 1. The real home page (hero,
 * featured products, brand story) is Day 2 work -- this just proves the
 * design tokens render correctly end to end and gives something branded
 * to look at instead of the default Next.js template.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center gap-6">
      <Logo size="lg" />
      <p className="max-w-md text-muted">
        Gilgit-Baltistan&apos;s first local fragrance brand -- now being
        rebuilt as a smart, AI-powered digital storefront.
      </p>
      <Button as={Link} href="/style-guide" variant="secondary">
        View style reference
      </Button>
    </main>
  );
}
