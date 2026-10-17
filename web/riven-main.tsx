
import { useEffect,useState } from "react";
import { createRoot } from "react-dom/client";

import Shell from "./calui/Shell";
import { Badge } from "./calui/Badge";
import { Button } from "./calui/Button";

import { products, type Product } from "./data";
import { SignIn } from "./screens/SignIn";
import { Search } from "./screens/Search";
import { Competitors } from "./screens/Competitors";
import { Detail } from "./screens/Detail";

import "./index.css";

type Page =
    
  | { name: "signin" }
  | { name: "search" }
  | { name: "competitors"; productId: string }
  | {
      name: "detail";
      productId: string;
      offerId: string;
    };

type CatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Product[] };

function RivenApp() {

    
    const [catalog, setCatalog] = useState<CatalogState>({
    status: "loading",
    });

    const [loadKey, setLoadKey] = useState(0);

    useEffect(() => {
    // Temporary simulated loading until the real API is ready.
    const timer = window.setTimeout(() => {
        const demoState = new URLSearchParams(
        window.location.search
        ).get("demoState");

        if (demoState === "error") {
        setCatalog({ status: "error" });
        } else {
        setCatalog({
            status: "ready",
            items: demoState === "empty" ? [] : products,
        });
        }
    }, 650);

    return () => window.clearTimeout(timer);
    }, [loadKey]);



  const [page, setPage] = useState<Page>({
    name: "signin",
  });

  // Sample products until the real product API is ready.
  const availableProducts =
    catalog.status === "ready" ? catalog.items : [];
    
    const product =
    "productId" in page
        ? availableProducts.find(
            (p) => p.id === page.productId
        )
        : undefined;

  const offer =
    page.name === "detail"
      ? product?.offers.find((o) => o.id === page.offerId)
      : undefined;

  function goToProducts() {
    setPage({ name: "search" });
  }

  // This is a UI demonstration, not real authentication.
  if (page.name === "signin") {
    return (
      <>
        <SignIn
         onSignIn={() => {
            setCatalog({ status: "loading" });
            setLoadKey((current) => current + 1);
            setPage({ name: "search" });
          }}
        />

        <p
          role="note"
          className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-sm rounded-md border border-subtle bg-default p-3 text-center text-sm text-default shadow-md"
        >
          Frontend demo only. Sign in opens sample screens
          without authenticating an account.
        </p>
      </>
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
              onClick={() =>
                setPage({
                  name: "competitors",
                  productId: product.id,
                })
              }
            >
              Back to offers
            </Button>
          )}
        </div>
      }
    >
      <p
        role="status"
        className="mb-4 rounded-md border border-subtle bg-cal-muted p-3 text-sm text-default"
      >
        Frontend demonstration using sample products, offers
        and price history. No live retailer account is
        connected.
      </p>

      
    {page.name === "search" ? (
        catalog.status === "loading" ? (
            <div
                role="status"
                className="rounded-md border border-subtle bg-default p-8 text-center"
                >
            <p className="text-sm text-subtle">
                Loading products...
            </p>
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
                Please try again.
            </p>

            <Button
                className="mt-4"
                onClick={() => {
                setCatalog({ status: "loading" });
                setLoadKey((current) => current + 1);
                }}
            >
                Retry
            </Button>
            </div>
        ) : (
            <Search
            items={catalog.items}
            onOpen={(productId) =>
                setPage({
                name: "competitors",
                productId,
                })
            }
            />
        )
       

      ) : page.name === "competitors" && product ? (
        <Competitors
          product={product}
          onOpenOffer={(offerId) =>
            setPage({
              name: "detail",
              productId: product.id,
              offerId,
            })
          }
        />
      ) : page.name === "detail" && product && offer ? (
        <Detail product={product} offerId={offer.id} />
      ) : (
        <div
          role="alert"
          className="rounded-md border border-subtle p-6"
        >
          <p className="text-sm text-default">
            The selected product or offer was not found.
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

      <footer className="mt-8 border-t border-subtle pt-4">
        <a
          href="/?view=observation-demo"
          className="text-sm text-default underline"
        >
          Open the original RIV-3 observation demo
        </a>
      </footer>
    </Shell>
  );
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element missing");
}

createRoot(root).render(<RivenApp />);
