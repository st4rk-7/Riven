import { useState } from "react";

import { Button } from "@coss/ui/components/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@coss/ui/components/card";
import { Field, FieldDescription, FieldLabel } from "@coss/ui/components/field";
import { Input } from "@coss/ui/components/input";

import type { NewProductInput } from "../riven-api";

// onAdd resolves to an error message, or null when the product was added.
export function AddProduct({ onAdd }: { onAdd: (input: NewProductInput) => Promise<string | null> }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Add a product you sell</CardTitle>
        <CardDescription>Paste its Amazon link, or type its name. Riven then looks for competitors selling it.</CardDescription>
      </CardHeader>
      <CardPanel>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            const message = await onAdd(url.trim() ? { url: url.trim() } : { name: name.trim(), brand: brand.trim() });
            // On success this screen unmounts, so only update state on failure.
            if (message) {
              setError(message);
              setBusy(false);
            }
          }}
        >
          <Field>
            <FieldLabel>Amazon product link</FieldLabel>
            <Input type="url" placeholder="https://www.amazon.co.uk/dp/…" value={url} onChange={(e) => setUrl(e.target.value)} />
            <FieldDescription>Riven reads the name from the page.</FieldDescription>
          </Field>
          <p className="text-sm text-muted-foreground">Or enter it yourself:</p>
          <Field>
            <FieldLabel>Product name</FieldLabel>
            <Input value={name} disabled={Boolean(url.trim())} required={!url.trim()} maxLength={500} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Brand (optional)</FieldLabel>
            <Input value={brand} disabled={Boolean(url.trim())} maxLength={200} onChange={(e) => setBrand(e.target.value)} />
          </Field>
          {error && (
            <p role="alert" className="text-sm text-destructive-foreground">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Adding…" : "Add product"}
          </Button>
        </form>
      </CardPanel>
    </Card>
  );
}
