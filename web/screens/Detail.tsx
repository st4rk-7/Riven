import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "../calui/Button";
import classNames from "../calui/classNames";
import { formatPrice, priceHistory, type Product } from "../data";
import { MatchBadge, StockBadge } from "../status";

export function Detail({ product, offerId }: { product: Product; offerId: string }) {
  const offer = product.offers.find((o) => o.id === offerId) ?? product.offers[0];
  const [range, setRange] = useState("Daily");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-md border border-subtle bg-default px-4 py-3">
          <p className="text-subtle text-sm">Current price</p>
          <p className="text-emphasis mt-1 text-xl font-semibold tabular-nums">{formatPrice(offer.price)}</p>
          <p className="text-muted mt-1 text-xs">As of {offer.observedAt}</p>
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
          <p className="text-emphasis mt-1 text-xl font-semibold">{offer.currency}</p>
        </div>
      </div>

      <div className="rounded-md border border-subtle bg-default">
        <div className="flex items-center justify-between border-b border-subtle px-4 py-3 sm:px-6">
          <p className="text-emphasis text-sm font-semibold">Price history</p>
          <div className="bg-cal-muted flex rounded-md p-0.5">
            {["Daily", "Weekly", "Monthly"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={classNames(
                  "rounded-[5px] px-2.5 py-1 text-sm font-medium transition",
                  r === range ? "bg-default text-emphasis shadow-sm" : "text-subtle hover:text-emphasis"
                )}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <div className="h-72" role="img" aria-label="Line chart of lowest and average competitor price over the last 7 days">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--cal-border-subtle)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--cal-text-subtle)" />
                <YAxis
                  orientation="right"
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                  tickFormatter={(v: number) => `£${v.toFixed(2)}`}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={56}
                  stroke="var(--cal-text-subtle)"
                />
                <Tooltip formatter={(v) => `£${Number(v).toFixed(2)}`} />
                <Line type="monotone" dataKey="lowest" name="Lowest" stroke="var(--riven-accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="average" name="Average" stroke="var(--cal-text-muted)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-muted mt-3 text-xs">Last updated 10 Oct, 14:05 · Sample data</p>
        </div>
      </div>

      {offer.matchStatus === "unverified" && (
        <div className="flex items-center justify-between rounded-md border border-subtle bg-default px-4 py-3 sm:px-6">
          <p className="text-default text-sm">Is this the same product as yours?</p>
          <div className="flex gap-2">
            <Button color="secondary">Not the same</Button>
            <Button color="primary">Confirm match</Button>
          </div>
        </div>
      )}
    </div>
  );
}
