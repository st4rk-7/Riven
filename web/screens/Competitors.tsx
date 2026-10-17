import { Badge } from "../calui/Badge";
import { Button } from "../calui/Button";
import { formatPrice, lowestPrice, type Product } from "../data";
import { MatchBadge, StockBadge } from "../status";

// Same list structure as Cal.diy's Event Types / Bookings lists.
export function Competitors({ product, onOpenOffer }: { product: Product; onOpenOffer: (offerId: string) => void }) {
  const confirmed = product.offers.filter((o) => o.matchStatus === "confirmed" && o.price !== null);
  const average =
    confirmed.length > 0
      ? (confirmed.reduce((sum, o) => sum + Number(o.price), 0) / confirmed.length).toFixed(2)
      : null;
  const inStock = product.offers.filter((o) => o.availability === "in_stock").length;

  const stats = [
    { label: "Your price", value: "[YOUR PRICE]" },
    { label: "Lowest competitor", value: formatPrice(lowestPrice(product.offers)) },
    { label: "Average (confirmed)", value: formatPrice(average) },
    { label: "In stock", value: `${inStock} of ${product.offers.length}` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-subtle bg-default px-4 py-3">
            <p className="text-subtle text-sm">{s.label}</p>
            <p className="text-emphasis mt-1 text-xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col overflow-hidden rounded-md border border-subtle bg-default">
        <ul className="w-full divide-y divide-subtle">
          {product.offers.map((o) => (
            <li key={o.id}>
              <div className="flex w-full items-center justify-between transition hover:bg-cal-muted">
                <button
                  type="button"
                  onClick={() => onOpenOffer(o.id)}
                  className="group flex w-full max-w-full items-center justify-between overflow-hidden px-4 py-4 text-left sm:px-6">
                  <div className="relative flex-1 overflow-hidden pr-4 text-sm">
                    <span className="break-words font-semibold text-default ltr:mr-1 rtl:ml-1">{o.seller}</span>
                    <small className="hidden font-normal text-subtle leading-4 sm:inline">/{o.source}</small>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="gray" startIcon="tag">
                        {formatPrice(o.price)}
                      </Badge>
                      <StockBadge value={o.availability} />
                      <MatchBadge value={o.matchStatus} />
                      <Badge variant="gray" startIcon="clock">
                        {o.observedAt}
                      </Badge>
                    </div>
                  </div>
                </button>
                <div className="mr-4 hidden shrink-0 sm:flex sm:mr-6">
                  <Button
                    color="secondary"
                    variant="icon"
                    StartIcon="ellipsis"
                    onClick={() => onOpenOffer(o.id)}
                    aria-label="Offer details"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-subtle text-sm">Unverified matches are excluded from the average.</p>
    </div>
  );
}
