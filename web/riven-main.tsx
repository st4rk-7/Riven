import { lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import Shell from "./calui/Shell";
import { Button } from "./calui/Button";
import { api, ApiError, type NewProductInput, type Session } from "./riven-api";
import { buildCatalog, UNLINKED_ID, type Product } from "./data";
import { SignIn } from "./screens/SignIn";
import { Search } from "./screens/Search";
import { Competitors } from "./screens/Competitors";
import { AddProduct } from "./screens/AddProduct";
import "./index.css";

// Recharts is only fetched after a user actually opens a product detail.
const Detail = lazy(() =>
  import("./screens/Detail").then((mod) => ({ default: mod.Detail })),
);

type Page =
  | { name: "search" }
  | { name: "add" }
  | { name: "competitors"; productId: string }
  | { name: "detail"; productId: string; offerId: string };

const DEFAULT_PAGE: Page = { name: "search" };

function readHistoryPage(state: unknown): Page | null {
  if (!state || typeof state !== "object") return null;

  const value = (state as { rivenPage?: unknown }).rivenPage;
  if (!value || typeof value !== "object") return null;

  const page = value as Record<string, unknown>;

  if (page.name === "search" || page.name === "add") {
    return { name: page.name };
  }

  if (
    page.name === "competitors" &&
    typeof page.productId === "string"
  ) {
    return {
      name: "competitors",
      productId: page.productId,
    };
  }

  if (
    page.name === "detail" &&
    typeof page.productId === "string" &&
    typeof page.offerId === "string"
  ) {
    return {
      name: "detail",
      productId: page.productId,
      offerId: page.offerId,
    };
  }

  return null;
}

type CatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Product[] };

function RivenApp() {
  const [session, setSession] = useState<Session | null | "checking">(
    "checking",
  );
  const [page, setPage] = useState<Page>(DEFAULT_PAGE);
  const [catalog, setCatalog] = useState<CatalogState>({
    status: "loading",
  });
  const [loadKey, setLoadKey] = useState(0);
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    const savedPage = readHistoryPage(window.history.state);

    if (savedPage) {
      setPage(savedPage);
    } else {
      const currentState =
        window.history.state &&
        typeof window.history.state === "object"
          ? window.history.state
          : {};

      window.history.replaceState(
        {
          ...currentState,
          rivenPage: DEFAULT_PAGE,
        },
        "",
        window.location.href,
      );
    }

    function handlePopState(event: PopStateEvent) {
      setPage(readHistoryPage(event.state) ?? DEFAULT_PAGE);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function navigate(
    nextPage: Page,
    mode: "push" | "replace" = "push",
  ) {
    const currentState =
      window.history.state &&
      typeof window.history.state === "object"
        ? window.history.state
        : {};

    const nextState = {
      ...currentState,
      rivenPage: nextPage,
    };

    if (mode === "replace") {
      window.history.replaceState(
        nextState,
        "",
        window.location.href,
      );
    } else {
      window.history.pushState(
        nextState,
        "",
        window.location.href,
      );
    }

    setPage(nextPage);
  }

  async function handleDiscover(productId: string) {
    setIsDiscovering(true);

    try {
      await api.discoverCompetitors(productId);
      setLoadKey((key) => key + 1);
    } finally {
      setIsDiscovering(false);
    }
  }

  // Returns an error message, or null once the product is added and competitor discovery has started.
  async function handleAddProduct(
    input: NewProductInput,
  ): Promise<string | null> {
    try {
      const created = await api.createProduct(input);
      const [products, observations] = await Promise.all([
        api.products(),
        api.observations(),
      ]);

      setCatalog({
        status: "ready",
        items: buildCatalog(products, observations),
      });
      navigate({
        name: "competitors",
        productId: created.id,
      });
      void handleDiscover(created.id).catch(() => undefined);

      return null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setSession(null);
      }

      return error instanceof ApiError && error.status === 400
        ? error.message
        : "Could not add the product. Try again.";
    }
  }

  async function handleRemoveProduct(productId: string) {
    await api.removeProduct(productId);
    navigate(DEFAULT_PAGE, "replace");
    setLoadKey((key) => key + 1);
  }

  async function handleRemoveListing(
    productId: string,
    observationId: string,
  ) {
    await api.removeListing(observationId);
    navigate(
      {
        name: "competitors",
        productId,
      },
      "replace",
    );
    setLoadKey((key) => key + 1);
  }

  async function handleMatchDecision(
    observationId: string,
    decision: "confirmed" | "mismatch",
  ) {
    await api.updateMatchStatus(observationId, decision);
    setLoadKey((key) => key + 1);
  }

  useEffect(() => {
    api.me().then(setSession, () => setSession(null));
  }, []);

  useEffect(() => {
    if (session === null || session === "checking") return;

    let cancelled = false;
    setCatalog({ status: "loading" });

    Promise.all([api.products(), api.observations()]).then(
      ([products, observations]) => {
        if (!cancelled) {
          setCatalog({
            status: "ready",
            items: buildCatalog(products, observations),
          });
        }
      },
      (error) => {
        if (cancelled) return;

        if (error instanceof ApiError && error.status === 401) {
          setSession(null);
        } else {
          setCatalog({ status: "error" });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [session, loadKey]);

  const availableProducts =
    catalog.status === "ready" ? catalog.items : [];

  const product =
    "productId" in page
      ? availableProducts.find(
          (availableProduct) =>
            availableProduct.id === page.productId,
        )
      : undefined;

  const offer =
    page.name === "detail"
      ? product?.offers.find(
          (availableOffer) =>
            availableOffer.id === page.offerId,
        )
      : undefined;

  function goToProducts() {
    navigate(DEFAULT_PAGE);
  }

  if (session === "checking") {
    return (
      <div
        role="status"
        className="flex min-h-svh items-center justify-center text-sm text-subtle"
      >
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
            navigate(DEFAULT_PAGE, "replace");
            return null;
          } catch (error) {
            if (
              error instanceof ApiError &&
              error.status === 429
            ) {
              return "Too many attempts. Wait a minute and try again.";
            }

            if (
              error instanceof ApiError &&
              error.status === 401
            ) {
              return "Email or password is incorrect.";
            }

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
            <Button
              StartIcon="plus"
              onClick={() => navigate({ name: "add" })}
            >
              Add product
            </Button>
          )}

          {(page.name === "competitors" ||
            page.name === "add") && (
            <Button
              color="secondary"
              StartIcon="arrow-left"
              onClick={goToProducts}
            >
              Products
            </Button>
          )}

          {page.name === "detail" && product && (
            <Button
              color="secondary"
              StartIcon="arrow-left"
              onClick={() => window.history.back()}
            >
              Back to offers
            </Button>
          )}
        </div>
      }
    >
      {page.name === "search" ? (
        catalog.status === "loading" ? (
          <div
            role="status"
            className="rounded-md border border-subtle bg-default p-8 text-center text-sm text-subtle"
          >
            Loading products...
          </div>
        ) : catalog.status === "error" ? (
          <div
            role="alert"
            className="rounded-md border border-subtle bg-default p-8 text-center"
          >
            <p className="text-sm font-semibold text-emphasis">
              Could not load products
            </p>
            <p className="mt-2 text-sm text-subtle">
              Check that the Riven server is running, then try
              again.
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
            onOpen={(productId) =>
              navigate({
                name: "competitors",
                productId,
              })
            }
          />
        )
      ) : page.name === "add" ? (
        <AddProduct onAdd={handleAddProduct} />
      ) : page.name === "competitors" && product ? (
        <Competitors
          product={product}
          onOpenOffer={(offerId) =>
            navigate({
              name: "detail",
              productId: product.id,
              offerId,
            })
          }
          onDiscover={() => handleDiscover(product.id)}
          isDiscovering={isDiscovering}
          onRemove={product.id === UNLINKED_ID ? undefined : () => handleRemoveProduct(product.id)}
          onRemoveOffer={(offerId) => handleRemoveListing(product.id, offerId)}
        />
      ) : page.name === "detail" && product && offer ? (
        <Suspense
          fallback={
            <div
              role="status"
              className="rounded-md border border-subtle p-8 text-sm text-subtle"
            >
              Loading price history...
            </div>
          }
        >
          <Detail
            product={product}
            offerId={offer.id}
            onMatchDecision={(decision) =>
              handleMatchDecision(offer.id, decision)
            }
            onRemove={() =>
              handleRemoveListing(product.id, offer.id)
            }
          />
        </Suspense>
      ) : (
        <div
          role="alert"
          className="rounded-md border border-subtle p-6"
        >
          <p className="text-sm text-default">
            The selected product or offer could not be found.
          </p>
          <Button
            color="secondary"
            className="mt-4"
            onClick={goToProducts}
          >
            Back to Products
          </Button>
        </div>
      )}
    </Shell>
  );
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element missing");
}

createRoot(root).render(<RivenApp />);
