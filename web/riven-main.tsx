import { lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import Shell from "./calui/Shell";
import { Badge } from "./calui/Badge";
import { Button } from "./calui/Button";
import { products, type Product } from "./data";
import { SignIn } from "./screens/SignIn";
import { Search } from "./screens/Search";
import { Competitors } from "./screens/Competitors";
import "./index.css";

// Recharts is only fetched after a user actually opens a product detail.
const Detail = lazy(() =>
  import("./screens/Detail").then((mod) => ({ default: mod.Detail }))
);

type Page =
  | { name: "signin" }
  | { name: "search" }
  | { name: "competitors"; productId: string }
  | { name: "detail"; productId: string; offerId: string };

type CatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Product[] };

function RivenApp() {
  const [page, setPage] = useState<Page>({ name: "signin" });
  const [catalog, setCatalog] = useState<CatalogState>({ status: "loading" });
  const [loadKey, setLoadKey] = useState(0);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  useEffect(() => {
    // Mock-only catalogue states. Replace with a real data request after RIV-15.
    const timer = window.setTimeout(() => {
      const mode = new URLSearchParams(window.location.search).get("demoState");
      if (mode === "error") {
        setCatalog({ status: "error" });
        return;
      }
      const items: Product[] =
        mode === "empty"
          ? []
          : mode === "no-offers"
            ? products.map((p, i) => (i === 0 ? { ...p, offers: [] } : p))
            : products;
      setCatalog({ status: "ready", items });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [loadKey]);

  const availableProducts = catalog.status === "ready" ? catalog.items : [];
  const product =
    "productId" in page
      ? availableProducts.find((p) => p.id === page.productId)
      : undefined;
  const offer =
    page.name === "detail"
      ? product?.offers.find((o) => o.id === page.offerId)
      : undefined;

  function goToProducts() {
    setReviewNotice(null);
    setPage({ name: "search" });
  }

  function reviewMatch(decision: "confirmed" | "mismatch") {
    if (page.name !== "detail" || catalog.status !== "ready") return;

    const { productId, offerId } = page;
    setCatalog((current) => {
      if (current.status !== "ready") return current;
      return {
        status: "ready",
        items: current.items.map((p) =>
          p.id !== productId
            ? p
            : {
                ...p,
                offers: p.offers.map((o) =>
                  o.id === offerId ? { ...o, matchStatus: decision } : o
                ),
              }
        ),
      };
    });
    setReviewNotice(
      decision === "confirmed"
        ? "Demo only: Match marked confirmed in this session; not saved to the server."
        : "Demo only: Offer marked as a mismatch in this session; not saved to the server."
    );
  }

  if (page.name === "signin") {
    return (
      <SignIn
        onSignIn={() => {
          setCatalog({ status: "loading" });
          setLoadKey((key) => key + 1);
          setReviewNotice(null);
          setPage({ name: "search" });
        }}
      />
    );
  }

  const heading =
    page.name === "search"
      ? "Products"
      : page.name === "competitors"
        ? product?.name ?? "Product unavailable"
        : offer
          ? `${offer.seller} · ${offer.source}`
          : "Offer unavailable";

  const subtitle =
    page.name === "search"
      ? "Search products and view competitor offers"
      : product?.name ?? "Sample product data";

  return (
    <Shell
      userName="Demo retailer"
      heading={heading}
      subtitle={subtitle}
      nav={[
        {
          name: "Products",
          icon: "package",
          current: page.name === "search",
          onClick: goToProducts,
        },
      ]}
      bottomNav={[]}
      onSignOut={() => setPage({ name: "signin" })}
      CTA={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="orange">Sample data</Badge>
          {page.name === "competitors" && (
            <Button color="secondary" StartIcon="arrow-left" onClick={goToProducts}>
              Products
            </Button>
          )}
          {page.name === "detail" && product && (
            <Button
              color="secondary"
              StartIcon="arrow-left"
              onClick={() => {
                setReviewNotice(null);
                setPage({ name: "competitors", productId: product.id });
              }}
            >
              Back to offers
            </Button>
          )}
        </div>
      }
    >
      <p className="mb-4 rounded-md border border-subtle bg-cal-muted p-3 text-sm text-default">
        Frontend demonstration using sample products, offers and price history.
        No live retailer account is connected.
      </p>

      {reviewNotice && (
        <p role="status" className="mb-4 rounded-md border border-subtle bg-default p-3 text-sm text-default">
          {reviewNotice}
        </p>
      )}

      {page.name === "search" ? (
        catalog.status === "loading" ? (
          <div role="status" className="rounded-md border border-subtle bg-default p-8 text-center text-sm text-subtle">
            Loading products...
          </div>
        ) : catalog.status === "error" ? (
          <div role="alert" className="rounded-md border border-subtle bg-default p-8 text-center">
            <p className="text-sm font-semibold text-emphasis">Could not load products</p>
            <p className="mt-2 text-sm text-subtle">
              Simulated error. Remove ?demoState=error from the URL to resume the sample catalogue.
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                setCatalog({ status: "loading" });
                setLoadKey((key) => key + 1);
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <Search
            items={catalog.items}
            onOpen={(productId) => setPage({ name: "competitors", productId })}
          />
        )
      ) : page.name === "competitors" && product ? (
        <Competitors
          product={product}
          onOpenOffer={(offerId) => {
            setReviewNotice(null);
            setPage({ name: "detail", productId: product.id, offerId });
          }}
        />
      ) : page.name === "detail" && product && offer ? (
        <Suspense
          fallback={
            <div role="status" className="rounded-md border border-subtle p-8 text-sm text-subtle">
              Loading price history...
            </div>
          }
        >
          <Detail
            product={product}
            offerId={offer.id}
            onMatchDecision={reviewMatch}
          />
        </Suspense>
      ) : (
        <div role="alert" className="rounded-md border border-subtle p-6">
          <p className="text-sm text-default">
            The selected product or offer could not be found.
          </p>
          <Button color="secondary" className="mt-4" onClick={goToProducts}>
            Back to Products
          </Button>
        </div>
      )}

      <footer className="mt-8 border-t border-subtle pt-4">
        <a href="/?view=observation-demo" className="text-sm text-default underline">
          Open the original RIV-3 observation demo
        </a>
      </footer>
    </Shell>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element missing");
createRoot(root).render(<RivenApp />);
