
import { useState } from "react";
import { createRoot } from "react-dom/client";

import Shell from "./calui/Shell";
import { Badge } from "./calui/Badge";
import { Button } from "./calui/Button";

import { Search } from "./screens/Search";
import { Competitors } from "./screens/Competitors";
import { products } from "./data";

import "./index.css";

function SearchPreview() {
  const [selectedId, setSelectedId] = useState<string | null>(
    null
  );

  const [selectedOfferId, setSelectedOfferId] = useState<
    string | null
  >(null);

  const selectedProduct = products.find(
    (product) => product.id === selectedId
  );

  const selectedOffer = selectedProduct?.offers.find(
    (offer) => offer.id === selectedOfferId
  );

  function backToProducts() {
    setSelectedId(null);
    setSelectedOfferId(null);
  }

  return (
    <Shell
      userName="Demo retailer"
      heading={
        selectedProduct ? selectedProduct.name : "Products"
      }
      subtitle={
        selectedProduct
          ? `${selectedProduct.brand} · ${selectedProduct.offers.length} competitor offers`
          : "Search a product to view competitor offers"
      }
      nav={[
        {
          name: "Products",
          icon: "package",
          current: true,
          onClick: backToProducts,
        },
      ]}
      bottomNav={[]}
      CTA={
        <div className="flex items-center gap-2">
          <Badge variant="orange">Sample data</Badge>

          {selectedProduct && (
            <Button
              color="secondary"
              StartIcon="arrow-left"
              onClick={backToProducts}
            >
              Products
            </Button>
          )}
        </div>
      }
    >
      {selectedProduct ? (
        <>
          <Competitors
            product={selectedProduct}
            onOpenOffer={setSelectedOfferId}
          />

          {selectedOffer && (
            <div
              role="status"
              className="mt-4 rounded-md border border-subtle bg-default p-4 text-sm text-default"
            >
              Selected offer: {selectedOffer.seller}.
              The detail screen will be connected next.
            </div>
          )}
        </>
      ) : (
        <Search
          onOpen={(productId) => {
            setSelectedId(productId);
            setSelectedOfferId(null);
          }}
        />
      )}
    </Shell>
  );
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element missing");
}

createRoot(root).render(<SearchPreview />);
