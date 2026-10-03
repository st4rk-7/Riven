export type DemoObservation = {
  mode: "synthetic";
  productName: string;
  price: string | null;
  currency: string;
  availability: "in_stock" | "out_of_stock" | "unknown";
  source: string;
  observedAt: string;
  matchStatus: "confirmed" | "unverified" | "mismatch";
};