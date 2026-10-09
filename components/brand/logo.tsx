import Image from "next/image";

// TODO(brand): replace the PNGs with an SVG export of the logo for crisp scaling.
const LOGO = { src: "/brand/rankr-logo.png", width: 410, height: 99 };
const MARK = { src: "/brand/rankr-mark.png", width: 512, height: 512 };

/** Full Rankr wordmark. `height` is in px; width follows the aspect ratio. */
export function Logo({ height = 28 }: { height?: number }) {
  return (
    <Image
      src={LOGO.src}
      alt="Rankr"
      width={Math.round((LOGO.width / LOGO.height) * height)}
      height={height}
      priority
    />
  );
}

/** The "R" mark on its own, for tight spaces. */
export function LogoMark({ height = 28 }: { height?: number }) {
  return (
    <Image
      src={MARK.src}
      alt="Rankr"
      width={Math.round((MARK.width / MARK.height) * height)}
      height={height}
    />
  );
}
