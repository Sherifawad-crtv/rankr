import type { CSSProperties } from "react";
import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/components/ui/cn";

const LINE_WIDTHS = ["w-4/5", "w-full", "w-3/5", "w-full", "w-2/3"];

function Lines({ animated }: { animated: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {LINE_WIDTHS.map((width, index) => (
        <span key={index} className={cn("block h-1.5 rounded-full bg-border-default/70", width)}>
          {animated && (
            <span
              className="block h-full origin-left animate-line-fill rounded-full bg-primary/40 rtl:origin-right"
              style={{ animationDelay: `${index * 0.35}s` }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

/** A little stack of CV pages being scanned. The badge shows the current pipeline stage. */
export function DocumentStack({ icon, stageKey }: { icon: IconName; stageKey: string }) {
  return (
    <div aria-hidden className="relative mx-auto h-44 w-36">
      <div
        className="absolute inset-0 -translate-x-3 animate-float rounded-xl border border-border-default bg-surface p-4 shadow-sm"
        style={{ "--tilt": "-8deg", animationDelay: "0.4s" } as CSSProperties}
      >
        <Lines animated={false} />
      </div>
      <div
        className="absolute inset-0 translate-x-3 animate-float rounded-xl border border-border-default bg-surface p-4 shadow-sm"
        style={{ "--tilt": "6deg", animationDelay: "0.9s" } as CSSProperties}
      >
        <Lines animated={false} />
      </div>
      <div
        className="absolute inset-0 animate-float overflow-hidden rounded-xl border border-border-default bg-surface p-4 shadow-lg"
        style={{ "--tilt": "0deg" } as CSSProperties}
      >
        <span className="mb-4 block size-6 rounded-full bg-primary/15" />
        <Lines animated />
        <span className="absolute inset-x-0 h-0.5 animate-scan bg-primary shadow-[0_0_12px_2px] shadow-primary/50" />
      </div>
      <span
        key={stageKey}
        className="absolute -end-3 -top-3 flex size-11 animate-pop items-center justify-center rounded-full bg-primary text-text-inverse shadow-md"
      >
        <Icon name={icon} variant="bold" size={22} />
      </span>
    </div>
  );
}
