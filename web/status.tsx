import { Badge } from "./calui/Badge";
import type { Availability, MatchStatus } from "./data";

const stock: Record<Availability, { label: string; variant: "green" | "red" | "gray" }> = {
  in_stock: { label: "In stock", variant: "green" },
  out_of_stock: { label: "Out of stock", variant: "red" },
  unknown: { label: "Unknown", variant: "gray" },
};

const match: Record<MatchStatus, { label: string; variant: "blue" | "orange" | "gray" }> = {
  confirmed: { label: "Confirmed", variant: "blue" },
  unverified: { label: "Unverified", variant: "orange" },
  mismatch: { label: "Mismatch", variant: "gray" },
};

export function StockBadge({ value }: { value: Availability }) {
  const s = stock[value];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function MatchBadge({ value }: { value: MatchStatus }) {
  const m = match[value];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
