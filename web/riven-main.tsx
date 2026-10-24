import { lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import Shell from "./calui/Shell";
import { Button } from "./calui/Button";
import { api, ApiError, type NewProductInput, type Session } from "./riven-api";
import { buildCatalog, type Product } from "./data";
import { SignIn } from "./screens/SignIn";
import { Search } from "./screens/Search";
import { Competitors } from "./screens/Competitors";
import { AddProduct } from "./screens/AddProduct";
import "./index.css";

// Recharts is only fetched after a user actually opens a product detail.
const Detail = lazy(() =>
  import("./screens/Detail").then((mod) => ({ default: mod.Detail }))
);

type Page =
  | { name: "search" }
  | { name: "add" }
  | { name: "competitors"; productId: string }
  | { name: "detail"; productId: string; offerId: string };

type CatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Product[] };

function RivenApp() {
  const [session, setSession] = useState<Session | null | "checking">("checking");
  const [page, setPage] = useState<Page>({ name: "search" });
  const [catalog, setCatalog] = useState<CatalogState>({ status: "loading" });
  const [loadKey, setLoadKey] = useState(0);
  const [isDiscovering, setIsDiscovering] = useState(false);

  async function handleDiscover(productId: string) {
    setIsDiscovering(true);
    try {
      await api.discoverCompetitors(productId);
      setLoadKey((k) => k + 1);
    } finally {
      setIsDiscovering(false);
    }
  }

  // Returns an error message, or null once the product is added and competitor discovery has started.
  async function handleAddProduct(input: NewProductInput): Promise<string | null> {
    try {
      const created = await api.createProduct(input);
      const [products, observations] = await Promise.all([api.products(), api.observations()]);
      setCatalog({ status: "ready", items: buildCatalog(products, observations) });
      setPage({ name: "competitors", productId: created.id });
      void handleDiscover(created.id).catch(() => undefined);
      return null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) setSession(null);
      return error instanceof ApiError && error.status === 400 ? error.message : "Could not add the product. Try again.";
    }
  }

  async function handleMatchDecision(observationId: string, decision: "confirmed" | "mismatch") {
    await api.updateMatchStatus(observationId, decision);
    setLoadKey((k) => k + 1);
  }

  useEffect(() => {
    api.me().then(setSession, () => setSession(null));
  }, []);

  useEffect(() => {
    if (session === null || session === "checking") return;
    let cancelled = false;
    setCatalog({ status: "loading" });
    Promise.all([api.products(), api.observations()]).then(
      ([products, observations]) => !cancelled && setCatalog({ status: "ready", items: buildCatalog(products, observations) }),
      (error) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) setSession(null);
        else setCatalog({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [session, loadKey]);

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
    setPage({ name: "search" });
  }

  if (session === "checking") {
    return (
      <div role="status" className="flex min-h-svh items-center justify-center text-sm text-subtle">
        Checking your session…
      </div>
    );
  }

  if (session === null) {
    return (
      <SignIn
        onSignIn={async (email, password) => {
          try {
            setSession(await api.signIn(email, password));
            setPage({ name: "search" });
            return null;
          } catch (error) {
            if (error instanceof ApiError && error.status === 429) return "Too many attempts. Wait a minute and try again.";
            if (error instanceof ApiError && error.status === 401) return "Email or password is incorrect.";
            return "Could not reach Riven. Check that the server is running and try again.";
          }
        }}
      />
    );
  }

  const heading =
    page.name === "search"
      ? "Products"
      : page.name === "add"
        ? "Add product"
      : page.name === "competitors"
        ? product?.name ?? "Product unavailable"
        : offer
          ? `${offer.seller} · ${offer.source}`
          : "Offer unavailable";

  const subtitle =
    page.name === "search"
      ? "Search products and view competitor offers"
      : page.name === "add"
        ? "Add a product you sell to start tracking competitors"
        : product?.name ?? "";

  return (
    <Shell
      userName={session.retailer.name}
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
      onSignOut={() => {
        // Clear the screen even if the request fails; the cookie expires on its own.
        void api.signOut().catch(() => undefined);
        setSession(null);
      }}
      CTA={
        <div className="flex flex-wrap items-center gap-2">
          {page.name === "search" && (
            <Button StartIcon="plus" onClick={() => setPage({ name: "add" })}>
              Add product
            </Button>
          )}
          {(page.name === "competitors" || page.name === "add") && (
            <Button color="secondary" StartIcon="arrow-left" onClick={goToProducts}>
              Products
            </Button>
          )}
          {page.name === "detail" && product && (
            <Button
              color="secondary"
              StartIcon="arrow-left"
              onClick={() => setPage({ name: "competitors", productId: product.id })}
            >
              Back to offers
            </Button>
          )}
        </div>
      }
    >
      {page.name === "search" ? (
        catalog.status === "loading" ? (
          <div role="status" className="rounded-md border border-subtle bg-default p-8 text-center text-sm text-subtle">
            Loading products...
          </div>
        ) : catalog.status === "error" ? (
          <div role="alert" className="rounded-md border border-subtle bg-default p-8 text-center">
            <p className="text-sm font-semibold text-emphasis">Could not load products</p>
            <p className="mt-2 text-sm text-subtle">
              Check that the Riven server is running, then try again.
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
      ) : page.name === "add" ? (
        <AddProduct onAdd={handleAddProduct} />
      ) : page.name === "competitors" && product ? (
        <Competitors
          product={product}
          onOpenOffer={(offerId) => setPage({ name: "detail", productId: product.id, offerId })}
          onDiscover={() => handleDiscover(product.id)}
          isDiscovering={isDiscovering}
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
            onMatchDecision={(decision) => handleMatchDecision(offer.id, decision)}
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
