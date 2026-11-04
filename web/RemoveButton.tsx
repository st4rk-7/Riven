import { useState } from "react";

import { Button } from "./calui/Button";

// Removal cannot be undone, so the first click only asks; the second click removes.
// `warning` says exactly what will be deleted, shown next to the confirm button.
export function RemoveButton({ label, warning, onRemove }: { label: string; warning: string; onRemove: () => Promise<void> }) {
  const [state, setState] = useState<"idle" | "confirm" | "removing" | "failed">("idle");

  if (state === "idle" || state === "failed") {
    return (
      <span className="flex items-center gap-2">
        {state === "failed" && <span role="alert" className="text-sm text-error">Could not remove. Try again.</span>}
        <Button color="secondary" onClick={() => setState("confirm")}>{label}</Button>
      </span>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span role="alert" className="text-sm text-emphasis">{warning}</span>
      <Button color="secondary" disabled={state === "removing"} onClick={() => setState("idle")}>Cancel</Button>
      <Button
        color="destructive"
        disabled={state === "removing"}
        onClick={() => {
          setState("removing");
          onRemove().catch(() => setState("failed"));
        }}
      >
        {state === "removing" ? "Removing…" : "Yes, delete"}
      </Button>
    </span>
  );
}
