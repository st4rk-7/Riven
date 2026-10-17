import { SearchIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "../calui/Badge";
import { Button } from "../calui/Button";
import { formatPrice, lowestPrice, products } from "../data";

// Same structure as Cal.diy's Event Types list (event-types-listing-view.tsx).
export function Search({ onOpen }: { onOpen: (productId: string) => void }) {
  const [query, setQuery] = useState("");
  const shown = products.filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label className="border-default bg-default flex h-9 max-w-64 flex-1 items-center gap-2 rounded-[10px] border px-3 text-sm focus-within:shadow-outline-gray-focused">
          <SearchIcon className="h-4 w-4 text-subtle" />
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="text-default placeholder:text-muted w-full bg-transparent outline-none"
          />
        </label>
      </div>

      <div className="flex flex-col overflow-hidden rounded-md border border-subtle bg-default">
        <ul className="w-full divide-y divide-subtle">
          {shown.map((p) => {
            const unverified = p.offers.filter((o) => o.matchStatus === "unverified").length;
            return (
              <li key={p.id}>
                <div className="flex w-full items-center justify-between transition hover:bg-cal-muted">
                  <button
                    type="button"
                    onClick={() => onOpen(p.id)}
                    className="group flex w-full max-w-full items-center justify-between overflow-hidden px-4 py-4 text-left sm:px-6">
                    <div className="relative flex-1 overflow-hidden pr-4 text-sm">
                      <span className="break-words font-semibold text-default ltr:mr-1 rtl:ml-1">{p.name}</span>
                      <small className="hidden font-normal text-subtle leading-4 sm:inline">/{p.brand.toLowerCase()}</small>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="gray" startIcon="store">
                          {p.offers.length} offers
                        </Badge>
                        <Badge variant="gray" startIcon="tag">
                          Lowest {formatPrice(lowestPrice(p.offers))}
                        </Badge>
                        {unverified > 0 ? (
                          <Badge variant="orange">{unverified} need review</Badge>
                        ) : (
                          <Badge variant="green">All matched</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                  <div className="mr-4 hidden shrink-0 sm:flex sm:mr-6">
                    <Button color="secondary" variant="icon" StartIcon="external-link" onClick={() => onOpen(p.id)} aria-label="Open" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
