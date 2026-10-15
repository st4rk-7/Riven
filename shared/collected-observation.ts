import { z } from "zod";

// What the browser extension sends: one offer read from a page the user viewed.
export const ExtensionOfferSchema = z
  .object({
    pageUrl: z.url(),
    asin: z.string().regex(/^[A-Z0-9]{10}$/),
    productName: z.string().trim().min(1).max(500),
    price: z
      .string()
      .regex(/^\d+\.\d{2}$/)
      .nullable(),
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .nullable(),
    availability: z.enum(["in_stock", "out_of_stock", "unknown"]),
    seller: z.string().trim().max(200).nullable(),
  })
  .refine((offer) => offer.price === null || offer.currency !== null, {
    message: "A price needs a currency.",
    path: ["currency"],
  });

export type ExtensionOffer = z.infer<typeof ExtensionOfferSchema>;

// What Riven stores and shows for a collected offer.
export type CollectedObservation = {
  id: string;
  // The retailer product this offer was linked to; null when none matched.
  productId: string | null;
  asin: string;
  productName: string;
  price: string | null;
  currency: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  seller: string | null;
  source: string;
  observedAt: string;
  matchStatus: "confirmed" | "unverified" | "mismatch";
  collectedVia: "extension" | "crawler";
};
