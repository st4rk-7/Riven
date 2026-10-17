
import { useState } from "react";
import { createRoot } from "react-dom/client";

import Shell from "./calui/Shell";
import { Badge } from "./calui/Badge";
import { Search } from "./screens/Search";
import { products } from "./data";

import "./index.css";

function SearchPreview() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedProduct = products.find(
    (product) => product.id === selectedId
  );

  return (
    <Shell
      userName="Demo retailer"
      heading="Products"
      subtitle="Search a product. Riven lists its competitor offers."
      nav={[
        {
          name: "Products",
          icon: "package",
          current: true,
          onClick: () => setSelectedId(null),
        },
      ]}
      bottomNav={[]}
      CTA={<Badge variant="orange">Sample data</Badge>}
    >
      <Search onOpen={setSelectedId} />

      {selectedProduct && (
        <div
          role="status"
          className="mt-4 rounded-md border border-subtle bg-default p-4 text-sm text-default"
        >
          Selected: <strong>{selectedProduct.name}</strong>.
          The competitor offers screen will be connected next.
        </div>
      )}
    </Shell>
  );
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element missing");
}

createRoot(root).render(<SearchPreview />);
