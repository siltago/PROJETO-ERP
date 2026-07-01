import { cn } from "@/ui/lib/cn";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  color?: string;
  className?: string;
}

const sizes: Record<AvatarSize, { box: string; text: string }> = {
  xs: { box: "h-6 w-6",   text: "text-[10px]" },
  sm: { box: "h-8 w-8",   text: "text-xs"     },
  md: { box: "h-9 w-9",   text: "text-sm"     },
  lg: { box: "h-11 w-11", text: "text-base"   },
  xl: { box: "h-14 w-14", text: "text-lg"     },
};

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function nameToColor(name?: string) {
  const colors = [
    "#0ea5e9","#8b5cf6","#ec4899","#f97316",
    "#10b981","#14b8a6","#6366f1","#f59e0b",
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (const c of name) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size = "md", color: colorProp, className }: AvatarProps) {
  const { box, text } = sizes[size];
  const color = colorProp ?? nameToColor(name);
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "avatar"}
        className={cn("rounded-full object-cover shrink-0 ring-2 ring-surface", box, className)}
      />
    );
  }

  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full shrink-0 font-bold text-white ring-2 ring-surface", box, text, className)}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </span>
  );
}

export function AvatarGroup({ items, max = 4 }: { items: { name?: string; src?: string }[]; max?: number }) {
  const visible = items.slice(0, max);
  const rest = items.length - max;
  return (
    <div className="flex items-center">
      {visible.map((item, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar src={item.src} name={item.name} size="sm" />
        </div>
      ))}
      {rest > 0 && (
        <span
          className="inline-flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold text-text-2 bg-surface-3 ring-2 ring-surface"
          style={{ marginLeft: -8 }}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
