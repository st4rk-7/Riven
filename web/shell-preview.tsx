
import { useState } from "react";
import { createRoot } from "react-dom/client";

import Shell from "./calui/Shell";
import { Button } from "./calui/Button";
import { Badge } from "./calui/Badge";

import "./index.css";

function ShellPreview() {
  const [page, setPage] = useState("Products");

  const nav = [
    {
      name: "Products",
      icon: "package",
      current: page === "Products",
      onClick: () => setPage("Products"),
    },
    {
      name: "Competitor offers",
      icon: "chart-line",
      current: page === "Competitor offers",
      onClick: () => setPage("Competitor offers"),
    },
  ];

  return (
    <Shell
      userName="Demo retailer"
      heading={page}
      subtitle="Riven dashboard layout preview"
      nav={nav}
      bottomNav={[]}
    >
      <div className="rounded-lg border border-default bg-default p-6">
        <h2 className="font-cal text-emphasis text-xl">
          Welcome to Riven
        </h2>

        <p className="mt-2 text-sm text-subtle">
          This is a temporary shared component preview.
          No live retailer data is displayed.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Badge variant="orange">
            Sample data
          </Badge>

          <Button
            onClick={() =>
              setPage(
                page === "Products"
                  ? "Competitor offers"
                  : "Products"
              )
            }
          >
            Switch preview
          </Button>
        </div>
      </div>
    </Shell>
  );
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element missing");
}

createRoot(root).render(<ShellPreview />);
