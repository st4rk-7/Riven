import { createRoot } from "react-dom/client";
import type { DemoObservation } from "../shared/demo-observation";

// Temporary local sample. Replace with the backend response during integration.
const observation: DemoObservation = {
  mode: "synthetic",
  productName: "Sample wired mouse",
  price: "19.99",
  currency: "GBP",
  availability: "in_stock",
  source: "Synthetic fixture (not Amazon)",
  observedAt: "2026-09-30T00:00:00Z",
  matchStatus: "unverified",
};

const availabilityLabels = {
  in_stock: "In stock",
  out_of_stock: "Out of stock",
  unknown: "Availability unknown",
};

const matchLabels = {
  confirmed: "Confirmed",
  unverified: "Unverified — product match has not been confirmed.",
  mismatch: "Mismatch — do not treat this as the same product.",
};

function App() {
  return (
    <main>
      <h1>Riven</h1>
      <p>
        Mode: {observation.mode}. Local sample — backend not connected.
      </p>

      <article aria-labelledby="observation-title">
        <h2 id="observation-title">{observation.productName}</h2>

        <dl>
          <dt>Price</dt>
          <dd>
            {observation.price === null
              ? "Price unavailable"
              : observation.price}
          </dd>

          <dt>Currency</dt>
          <dd>{observation.currency}</dd>

          <dt>Availability</dt>
          <dd>{availabilityLabels[observation.availability]}</dd>

          <dt>Source</dt>
          <dd>{observation.source}</dd>

          <dt>Observed at</dt>
          <dd>
            <time dateTime={observation.observedAt}>
              {new Date(observation.observedAt).toUTCString()}
            </time>
          </dd>

          <dt>Product match</dt>
          <dd>{matchLabels[observation.matchStatus]}</dd>
        </dl>
      </article>
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The HTML root element is missing.");
}

createRoot(rootElement).render(<App />);