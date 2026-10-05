export type DemoObservation = {
  // "synthetic" = fixture values; "practice" = fetched live from the practice site.
  mode: "synthetic" | "practice";
  productName: string;
  price: string | null;
  currency: string;
  availability: "in_stock" | "out_of_stock" | "unknown";
  source: string;
  observedAt: string;
  matchStatus: "confirmed" | "unverified" | "mismatch";
};