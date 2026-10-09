import type { CSSProperties, ReactNode } from "react";
import { isValidHex, readableTextOn } from "@/lib/branding";
import type { OrgBranding } from "@/types";

/**
 * Re-skins everything inside it with an organisation's brand colour (white-label portal).
 * Only the primary colour and its contrast text change; hover and focus colours follow from it.
 * An invalid colour is ignored so a bad setting can never break the page.
 */
export function BrandScope({
  branding,
  children,
  className,
}: {
  branding: OrgBranding;
  children: ReactNode;
  className?: string;
}) {
  const style: CSSProperties = isValidHex(branding.primaryColor)
    ? ({
        "--color-interactive-primary": branding.primaryColor,
        "--color-interactive-primary-contrast": readableTextOn(branding.primaryColor),
      } as CSSProperties)
    : {};
  return (
    <div data-brand className={className} style={style}>
      {children}
    </div>
  );
}
