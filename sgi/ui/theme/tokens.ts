export type Theme = "light" | "dark" | "system";
export type FrameTheme = "frame" | "none";

export const MOTION = {
  hover:   120,
  click:   80,
  sidebar: 180,
  modal:   220,
  toast:   200,
  page:    180,
} as const;

export const RADIUS = {
  sm:   "6px",
  md:   "10px",
  lg:   "16px",
  xl:   "18px",
  full: "9999px",
} as const;

export const SPACING = [4, 8, 16, 24, 32, 40, 48, 64, 80] as const;

export const TYPE_SCALE = {
  display:  { size: "2.25rem",   weight: 900, leading: 1.2  },
  h1:       { size: "1.875rem",  weight: 700, leading: 1.25 },
  h2:       { size: "1.5rem",    weight: 700, leading: 1.25 },
  h3:       { size: "1.25rem",   weight: 600, leading: 1.3  },
  subtitle: { size: "1.125rem",  weight: 600, leading: 1.4  },
  body:     { size: "0.875rem",  weight: 400, leading: 1.5  },
  caption:  { size: "0.8125rem", weight: 400, leading: 1.5  },
  small:    { size: "0.75rem",   weight: 400, leading: 1.5  },
} as const;

export type TypeVariant = keyof typeof TYPE_SCALE;
