import { createFileRoute } from "@tanstack/react-router";
import { BtbShell } from "@/components/btb/BtbShell";
import { BTB } from "@/lib/btb/manifest";

export const Route = createFileRoute("/my-programmes/basic-training-blueprint-plus/calculator")({
  head: () => ({ meta: [{ title: "Basic Training Blueprint+ — Calculator" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CalcPage,
});

function CalcPage() {
  const rows: any[] = (BTB as any).calculator?.pace_table ?? [];

  return (
    <BtbShell eyebrow="Pace guidance" title="Calculator">
      <p className="text-foreground-muted text-sm max-w-[60ch]">
        Reference splits for your target 2 km performance. Use these to calibrate interval and threshold sessions.
      </p>
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-foreground-muted border-b border-border">
              <th className="py-3 pr-4">2 km</th>
              <th className="py-3 pr-4">200 m</th>
              <th className="py-3 pr-4">400 m</th>
              <th className="py-3 pr-4">800 m</th>
              <th className="py-3 pr-4">1 km</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((r) => (
              <tr key={r.twoKm}>
                <td className="py-3 pr-4 text-bone tabular">{r.twoKm}</td>
                <td className="py-3 pr-4 text-foreground-muted tabular">{r.two_hundred}</td>
                <td className="py-3 pr-4 text-foreground-muted tabular">{r.four_hundred}</td>
                <td className="py-3 pr-4 text-foreground-muted tabular">{r.eight_hundred}</td>
                <td className="py-3 pr-4 text-foreground-muted tabular">{r.one_km}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-foreground-muted text-xs max-w-[60ch]">
        Threshold running should feel controlled and sustainable — roughly RPE 7-8. Aim to complete every rep in your current 2 km pace bracket during structured intervals.
      </p>
    </BtbShell>
  );
}