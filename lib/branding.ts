const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

export function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value);
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** White or near-black text, whichever reads better on the given background. */
export function readableTextOn(hex: string): string {
  return luminance(hex) > 0.4 ? "#0a1c36" : "#ffffff";
}
