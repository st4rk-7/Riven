// Sample data only — shapes follow Riven's observation contract.

export type Availability = "in_stock" | "out_of_stock" | "unknown";
export type MatchStatus = "confirmed" | "unverified" | "mismatch";

export type Offer = {
  id: string;
  seller: string;
  source: string;
  price: string | null;
  currency: "GBP";
  availability: Availability;
  matchStatus: MatchStatus;
  observedAt: string;
};

export type Product = {
  id: string;
  brand: string;
  name: string;
  offers: Offer[];
};

const offers: Offer[] = [
  { id: "a", seller: "Seller A", source: "Amazon UK", price: "11.49", currency: "GBP", availability: "in_stock", matchStatus: "confirmed", observedAt: "10 Oct, 14:05" },
  { id: "b", seller: "Seller B", source: "Amazon UK", price: "12.19", currency: "GBP", availability: "in_stock", matchStatus: "confirmed", observedAt: "10 Oct, 14:05" },
  { id: "c", seller: "Seller C", source: "Amazon UK", price: "12.49", currency: "GBP", availability: "unknown", matchStatus: "unverified", observedAt: "10 Oct, 14:04" },
  { id: "d", seller: "Seller D", source: "Amazon UK", price: "12.99", currency: "GBP", availability: "in_stock", matchStatus: "confirmed", observedAt: "10 Oct, 14:04" },
  { id: "e", seller: "Seller E", source: "Amazon UK", price: "13.20", currency: "GBP", availability: "out_of_stock", matchStatus: "confirmed", observedAt: "10 Oct, 14:03" },
  { id: "f", seller: "Seller F", source: "Amazon UK", price: null, currency: "GBP", availability: "in_stock", matchStatus: "confirmed", observedAt: "10 Oct, 14:03" },
];

export const products: Product[] = [
  { id: "m185", brand: "Logitech", name: "M185 Wireless Mouse, Grey", offers },
  { id: "m330", brand: "Logitech", name: "M330 Silent Plus Wireless Mouse", offers: offers.slice(0, 4) },
  { id: "m350", brand: "Logitech", name: "Pebble M350 Wireless Mouse", offers: offers.slice(1, 6) },
];

export const priceHistory = [
  { day: "4 Oct", lowest: 12.49, average: 13.4 },
  { day: "5 Oct", lowest: 12.49, average: 13.31 },
  { day: "6 Oct", lowest: 12.19, average: 13.22 },
  { day: "7 Oct", lowest: 12.19, average: 13.05 },
  { day: "8 Oct", lowest: 11.99, average: 12.98 },
  { day: "9 Oct", lowest: 11.99, average: 12.91 },
  { day: "10 Oct", lowest: 11.49, average: 12.86 },
];

export function formatPrice(price: string | null): string {
  return price === null ? "Price unavailable" : `£${price}`;
}

export function lowestPrice(list: Offer[]): string | null {
  const prices = list.map((o) => o.price).filter((p): p is string => p !== null);
  if (prices.length === 0) return null;
  return prices.reduce((a, b) => (Number(a) <= Number(b) ? a : b));
}
