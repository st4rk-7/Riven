import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { DemoObservation } from "../shared/demo-observation";
import { fetchDemoObservation } from "./observation-api";



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

function ObservationCard({
  observation,
}: {
  observation: DemoObservation;
}) {
  return (
    <main>
      <h1>Riven</h1>
      <p>
        Mode: {observation.mode}. Received from the local backend.
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

type ObservationState =
  | { status: "loading" }
  | { status: "success"; observation: DemoObservation }
  | { status: "error" };

function App() {
  const [state, setState] = useState<ObservationState>({
    status: "loading",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState({ status: "loading" });

    const timeout = window.setTimeout(() => {
      controller.abort();
      setState({ status: "error" });
    }, 10000);

    fetchDemoObservation(controller.signal)
      .then((observation) => {
        if (!controller.signal.aborted) {
          setState({ status: "success", observation });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      })
      .finally(() => {
        window.clearTimeout(timeout);
      });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  if (state.status === "success") {
    return <ObservationCard observation={state.observation} />;
  }

  return (
    <main>
      <h1>Riven</h1>
      <p>Synthetic observation demo — not live Amazon data.</p>

      {state.status === "loading" ? (
        <p role="status">Loading observation…</p>
      ) : (
        <>
          <p role="alert">
            Could not load the observation. Check that the local backend
            is running, then retry.
          </p>
          <button
            type="button"
            onClick={() => setAttempt((previous) => previous + 1)}
          >
            Retry
          </button>
        </>
      )}
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The HTML root element is missing.");
}

createRoot(rootElement).render(<App />);