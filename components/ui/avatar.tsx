import { cn } from "./cn";

const sizes = { sm: "size-8 text-sm", md: "size-10 text-base", lg: "size-14 text-xl" };

/** Initials only. Rankr never shows photos. */
export function Avatar({ name, size = "sm" }: { name: string; size?: keyof typeof sizes }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary",
        sizes[size],
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
