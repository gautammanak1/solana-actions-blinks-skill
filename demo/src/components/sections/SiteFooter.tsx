import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
      <Separator className="mb-6" />
      <p className="text-muted-foreground text-center text-sm">
        Built with Solana Actions · Devnet demo
      </p>
    </footer>
  );
}
