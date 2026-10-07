import type { DemoObservation } from "../shared/demo-observation";

function isDemoObservation(value: unknown): value is DemoObservation {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    data.mode === "synthetic" &&
    typeof data.productName === "string" &&
    (data.price === null || typeof data.price === "string") &&
    typeof data.currency === "string" &&
    (
      data.availability === "in_stock" ||
      data.availability === "out_of_stock" ||
      data.availability === "unknown"
    ) &&
    typeof data.source === "string" &&
    typeof data.observedAt === "string" &&
    !Number.isNaN(Date.parse(data.observedAt)) &&
    (
      data.matchStatus === "confirmed" ||
      data.matchStatus === "unverified" ||
      data.matchStatus === "mismatch"
    )
  );
}

export async function fetchDemoObservation(
  signal?: AbortSignal,
): Promise<DemoObservation> {
  const response = await fetch("/api/v1/demo-observation", {
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("The observation request failed.");
  }

  const data: unknown = await response.json();

  if (!isDemoObservation(data)) {
    throw new Error("The backend returned an unexpected observation.");
  }

  return data;
}