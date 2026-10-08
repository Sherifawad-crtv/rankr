import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "upload"
  | "user"
  | "list"
  | "briefcase"
  | "chart"
  | "message"
  | "file"
  | "settings"
  | "search"
  | "filter"
  | "close"
  | "chevron-right"
  | "chevron-down"
  | "plus"
  | "edit"
  | "trash"
  | "star"
  | "bell"
  | "calendar"
  | "check"
  | "alert";

const paths: Record<IconName, ReactNode> = {
  upload: <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  briefcase: <path d="M4 8h16v11H4zM9 8V5h6v3M4 13h16" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  message: <path d="M4 5h16v11H9l-5 4z" />,
  file: <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6" />,
  settings: (
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-12v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1" />
  ),
  search: <path d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" />,
  trash: <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  bell: <path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 21h4" />,
  calendar: <path d="M4 6h16v14H4zM4 10h16M8 3v4m8-4v4" />,
  check: <path d="m5 12 5 5 9-10" />,
  alert: <path d="M12 8v5m0 3h.01M10.3 4 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z" />,
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
}

/** Inline SVG icons: 1.75px rounded stroke on a 24px grid. Decorative unless `aria-label` is set. */
export function Icon({ name, size = 20, ...rest }: IconProps) {
  const decorative = !rest["aria-label"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={decorative}
      role={decorative ? undefined : "img"}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
