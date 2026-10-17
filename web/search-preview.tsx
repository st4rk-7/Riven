
import { useState } from "react";
import { createRoot } from "react-dom/client";

import Shell from "./calui/Shell";
import { Badge } from "./calui/Badge";
import { Button } from "./calui/Button";

import { Search } from "./screens/Search";
import { Competitors } from "./screens/Competitors";
import { Detail } from "./screens/Detail";
import { products } from "./data";

import "./index.css";

function SearchPreview() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  const selectedProduct = products.find(
    (product) => product.id === selectedId
  );

  const selectedOffer = selectedProduct?.offers.find(
    (offer) => offer.id === selectedOfferId
  );

  function showProducts() {
    setSelectedId(null);
    setSelectedOfferId(null);
  }

  function showCompetitors() {
    setSelectedOfferId(null);
  }

  const isDetail = selectedProduct && selectedOffer;

  const heading = isDetail
    ? `${selectedOffer.seller} · ${selectedOffer.source}`
    : selectedProduct
      ? selectedProduct.name
      : "Products";

  const subtitle = isDetail
    ? selectedProduct.name
    : selectedProduct
      ? `${selectedProduct.brand} · Competitor offers`
      : "Search a product to view competitor offers";

  return (
    <Shell
      userName="Demo retailer"
      heading={heading}
      subtitle={subtitle}
      nav={[
        {
          name: "Products",
          icon: "package",
          current: !selectedProduct,
          onClick: showProducts,
        },
      ]}
      bottomNav={[]}
      CTA={
        <div className="flex items-center gap-2">
          <Badge variant="orange">Sample data</Badge>

          {isDetail ? (
            <Button
              color="secondary"
              StartIcon="arrow-left"
              onClick={showCompetitors}
            >
              Back to offers
            </Button>
          ) : selectedProduct ? (
            <Button
              color="secondary"
              StartIcon="arrow-left"
              onClick={showProducts}
            >
              Products
            </Button>
          ) : null}
        </div>
      }
    >
      {isDetail ? (
        <>
          <Detail
            product={selectedProduct}
            offerId={selectedOffer.id}
          />

          <p className="mt-4 text-sm text-subtle">
            Demonstration only: Price history is sample data.
            Match confirmation is not connected to the backend.
          </p>
        </>
      ) : selectedProduct ? (
        <Competitors
          product={selectedProduct}
          onOpenOffer={setSelectedOfferId}
        />
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
