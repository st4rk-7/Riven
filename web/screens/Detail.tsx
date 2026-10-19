import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "../calui/Button";
import { formatPrice, formatTime, type Product } from "../data";
import { MatchBadge, StockBadge } from "../status";

export function Detail({
  product,
  offerId,
  onMatchDecision,
}: {
  product: Product;
  offerId: string;
  onMatchDecision?: (decision: "confirmed" | "mismatch") => void;
}) {
  const offer = product.offers.find((o) => o.id === offerId);

  if (!offer) {
    return (
      <div role="alert" className="rounded-md border border-subtle p-6 text-sm text-default">
        Offer unavailable. Return to the competitor list and choose another offer.
      </div>
    );
  }

  const chartData = offer.history.map((p) => ({ time: formatTime(p.observedAt), price: p.price }));
  const pricedPoints = offer.history.filter((p) => p.price !== null).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-md border border-subtle bg-default px-4 py-3">
          <p className="text-subtle text-sm">Current price</p>
          <p className="text-emphasis mt-1 break-words text-base font-semibold tabular-nums sm:text-xl">{formatPrice(offer.price, offer.currency)}</p>
          <p className="text-muted mt-1 text-xs">As of {formatTime(offer.observedAt)}</p>
        </div>
        <div className="rounded-md border border-subtle bg-default px-4 py-3">
          <p className="text-subtle text-sm">Stock</p>
          <div className="mt-2">
            <StockBadge value={offer.availability} />
          </div>
        </div>
        <div className="rounded-md border border-subtle bg-default px-4 py-3">
          <p className="text-subtle text-sm">Match</p>
          <div className="mt-2">
            <MatchBadge value={offer.matchStatus} />
          </div>
        </div>
        <div className="rounded-md border border-subtle bg-default px-4 py-3">
          <p className="text-subtle text-sm">Currency</p>
          <p className="text-emphasis mt-1 text-xl font-semibold">{offer.currency ?? "Unknown"}</p>
        </div>
      </div>

      <div className="rounded-md border border-subtle bg-default">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle px-4 py-3 sm:px-6">
          <p className="text-emphasis text-sm font-semibold">Price history for this seller</p>
          <span className="text-xs text-subtle">{offer.history.length} observations · {offer.source}</span>
        </div>
        <div className="px-4 py-4 sm:px-6">
          {pricedPoints < 2 ? (
            <p role="status" className="py-12 text-center text-sm text-subtle">
              Not enough history yet. Each time this page is sent to Riven, a new point is added.
            </p>
          ) : (
            <div className="h-72" role="img" aria-label={`Line chart of ${offer.seller}'s price over ${offer.history.length} observations`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--cal-border-subtle)" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={12} stroke="var(--cal-text-subtle)" />
                  <YAxis
                    orientation="right"
                    domain={["dataMin - 0.5", "dataMax + 0.5"]}
                    tickFormatter={(v: number) => formatPrice(v.toFixed(2), offer.currency)}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={64}
                    stroke="var(--cal-text-subtle)"
                  />
                  <Tooltip formatter={(v) => formatPrice(Number(v).toFixed(2), offer.currency)} />
                  <Line type="monotone" dataKey="price" name="Price" stroke="var(--riven-accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="text-muted mt-3 text-xs">Last updated {formatTime(offer.observedAt)} · Gaps mean the price was unavailable</p>
        </div>
      </div>

      {offer.matchStatus === "unverified" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-subtle bg-default px-4 py-3 sm:px-6">
          <p className="text-default text-sm">Is this the same product as yours?</p>
          <div className="flex flex-wrap gap-2">
            <Button
              color="secondary"
              disabled={!onMatchDecision}
              onClick={() => onMatchDecision?.("mismatch")}
            >
              Not the same
            </Button>
            <Button
              color="primary"
              disabled={!onMatchDecision}
              onClick={() => onMatchDecision?.("confirmed")}
            >
              Confirm match
            </Button>
          </div>
        </div>
      )}
      {offer.matchStatus === "unverified" && !onMatchDecision && (
        <p className="text-xs text-subtle">Review controls require the Riven application API.</p>
      )}
    </div>
  );
}
