import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Coins className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Tip Jar</p>
            <p className="text-muted-foreground mt-1 text-xs">Solana Actions</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          Devnet
        </Badge>
      </div>
    </header>
  );
}
