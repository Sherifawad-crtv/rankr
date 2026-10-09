import type { SVGProps } from "react";
import { cn } from "./cn";
import { solarIcons, type IconName } from "./solar-icons.generated";

export type { IconName };

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  /** `bold` is used for active or selected states. */
  variant?: "linear" | "bold";
  /** Flip horizontally in right-to-left layouts (arrows, chevrons). */
  mirrorRtl?: boolean;
}

/**
 * Solar icon set (480 Design, CC BY 4.0), inlined at build time by scripts/generate-icons.mjs.
 * Decorative unless `aria-label` is set.
 */
export function Icon({
  name,
  size = 20,
  variant = "linear",
  mirrorRtl = false,
  className,
  ...rest
}: IconProps) {
  const decorative = !rest["aria-label"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={decorative}
      role={decorative ? undefined : "img"}
      className={cn("shrink-0", mirrorRtl && "rtl:-scale-x-100", className)}
      // Trusted static markup generated from the Solar package at build time.
      dangerouslySetInnerHTML={{ __html: solarIcons[name][variant] }}
      {...rest}
    />
  );
}
