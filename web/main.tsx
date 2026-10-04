import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import type { DemoObservation } from "../shared/demo-observation";

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

function isDemoObservation(value: unknown): value is DemoObservation {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.mode === "synthetic" &&
    typeof candidate.productName === "string" &&
    (candidate.price === null || typeof candidate.price === "string") &&
    typeof candidate.currency === "string" &&
    (candidate.availability === "in_stock" ||
      candidate.availability === "out_of_stock" ||
      candidate.availability === "unknown") &&
    typeof candidate.source === "string" &&
    typeof candidate.observedAt === "string" &&
    (candidate.matchStatus === "confirmed" ||
      candidate.matchStatus === "unverified" ||
      candidate.matchStatus === "mismatch")
  );
}

async function fetchObservation(
  signal?: AbortSignal,
): Promise<DemoObservation> {
  const response = await fetch("/api/v1/demo-observation", { signal });

  if (!response.ok) {
    throw new Error(`Observation request failed with status ${response.status}`);
  }

  const value: unknown = await response.json();

  if (!isDemoObservation(value)) {
    throw new Error("Observation response did not match the agreed contract");
  }

  return value;
}

function App() {
  const [observation, setObservation] = useState<DemoObservation | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const requestObservation = useCallback(async (signal?: AbortSignal) => {
    setStatus("loading");

    try {
      const nextObservation = await fetchObservation(signal);
      setObservation(nextObservation);
      setStatus("ready");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setObservation(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void requestObservation(controller.signal);

    return () => {
      controller.abort();
    };
  }, [requestObservation]);

  return (
    <main>
      <h1>Riven</h1>
      <p>Demo mode: synthetic data only — not Amazon.</p>

      {status === "loading" && <p role="status">Loading observation…</p>}

      {status === "error" && (
        <div role="alert">
          <p>Could not load the synthetic observation.</p>
          <button type="button" onClick={() => void requestObservation()}>
            Retry
          </button>
        </div>
      )}

      {status === "ready" && observation && (
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
      )}
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The HTML root element is missing.");
}

createRoot(rootElement).render(<App />);