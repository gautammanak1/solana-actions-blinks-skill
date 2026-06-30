import { CopyButton } from "@/components/CopyButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";

const PRODUCTION_ORIGIN = "https://solana-actions-blinks-demo-nine.vercel.app";
const ACTION_PATH = "/api/actions/transfer-sol";

export function DeveloperSection() {
  const actionUrl = `${PRODUCTION_ORIGIN}${ACTION_PATH}`;
  const curlCommand = `curl -s ${actionUrl} | jq '.title, .links.actions[].label'`;

  const links = [
    { label: "Action API", href: actionUrl },
    { label: "actions.json", href: `${PRODUCTION_ORIGIN}/actions.json` },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">For developers</CardTitle>
          <CardDescription>
            Spec-compliant GET/POST endpoints you can inspect or embed anywhere.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {links.map((link) => (
              <li key={link.label} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-muted-foreground w-24 shrink-0 text-sm">{link.label}</span>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-flex items-center gap-1 break-all text-sm hover:underline"
                >
                  {link.href}
                  <ExternalLink className="size-3.5 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="relative">
            <pre className="bg-muted/50 overflow-x-auto rounded-lg border p-4 pr-16 font-mono text-xs leading-relaxed">
              {curlCommand}
            </pre>
            <div className="absolute top-2 right-2">
              <CopyButton text={curlCommand} />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
