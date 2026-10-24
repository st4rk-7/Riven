import { Badge } from "../calui/Badge";
import { Button } from "../calui/Button";
import { averagePrice, formatPrice, formatTime, lowestPrice, type Product } from "../data";
import { MatchBadge, StockBadge } from "../status";

// Same list structure as Cal.diy's Event Types / Bookings lists.
export function Competitors({
  product,
  onOpenOffer,
  onDiscover,
  isDiscovering,
}: {
  product: Product;
  onOpenOffer: (offerId: string) => void;
  onDiscover?: () => void;
  isDiscovering?: boolean;
}) {
  const inStock = product.offers.filter((o) => o.availability === "in_stock").length;

  const stats = [
    { label: "Your price", value: "Not connected" },
    { label: "Lowest confirmed offer", value: lowestPrice(product.offers) },
    { label: "Average (confirmed)", value: averagePrice(product.offers) },
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-emphasis">Competitor offers</h2>
          <p className="text-sm text-subtle">Offers matched via extension or automated discovery.</p>
        </div>
        {onDiscover && (
          <Button
            color="primary"
            disabled={isDiscovering}
            onClick={onDiscover}
          >
            {isDiscovering ? "Searching Amazon..." : "Discover competitors"}
          </Button>
        )}
      </div>

      <div className="flex flex-col overflow-hidden rounded-md border border-subtle bg-default">
        <ul className="w-full divide-y divide-subtle">
          {product.offers.length === 0 && (
            <li className="px-5 py-12 text-center" role="status">
              <p className="text-sm font-semibold text-emphasis">No competitor offers yet</p>
              <p className="mt-2 text-sm text-subtle">
                Click "Discover competitors" to automatically find matching listings, or send a page with the browser extension.
              </p>
              {onDiscover && (
                <div className="mt-4 flex justify-center">
                  <Button
                    color="primary"
                    disabled={isDiscovering}
                    onClick={onDiscover}
                  >
                    {isDiscovering ? "Searching Amazon..." : "Discover competitors"}
                  </Button>
                </div>
              )}
            </li>
          )}
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
                        {formatPrice(o.price, o.currency)}
                      </Badge>
                      <StockBadge value={o.availability} />
                      <MatchBadge value={o.matchStatus} />
                      <Badge variant="gray" startIcon="clock">
                        {formatTime(o.observedAt)}
                      </Badge>
                      <Badge variant={o.collectedVia === "crawler" ? "blue" : "gray"}>
                        {o.collectedVia === "crawler" ? "Scheduled" : "Extension"}
                      </Badge>
                    </div>
                  </div>
                </button>
                <div className="mr-4 hidden shrink-0 sm:flex sm:mr-6">
                  <Button
                    color="secondary"
                    variant="icon"
                    StartIcon="arrow-right"
                    onClick={() => onOpenOffer(o.id)}
                    aria-label={`View ${o.seller} offer details`}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-subtle text-sm">Only confirmed matches are used for the lowest-price and average comparisons. Your own price is not yet connected.</p>
    </div>
  );
}
