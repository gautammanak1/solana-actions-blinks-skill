import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plug, Sparkles, Wallet } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Connect wallet",
    description: "Use Phantom or Solflare on devnet.",
  },
  {
    icon: Sparkles,
    title: "Choose amount",
    description: "Quick presets or enter a custom SOL value.",
  },
  {
    icon: Plug,
    title: "Confirm tip",
    description: "Approve once — the transfer lands on-chain.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
        <p className="text-muted-foreground mt-1 text-sm">Three steps from wallet to receipt.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title} className="gap-4 py-5 shadow-none">
            <CardHeader className="px-5 pb-0">
              <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                <span className="bg-secondary text-secondary-foreground flex size-6 items-center justify-center rounded-full text-[11px]">
                  {index + 1}
                </span>
                Step
              </div>
              <CardTitle className="flex items-center gap-2 text-base">
                <step.icon className="text-primary size-4" />
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
