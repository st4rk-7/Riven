import { useState } from "react";

import { Button } from "@coss/ui/components/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@coss/ui/components/card";
import { Field, FieldLabel } from "@coss/ui/components/field";
import { Input } from "@coss/ui/components/input";

// onSignIn resolves to an error message, or null when signed in.
export function SignIn({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<string | null> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 px-4">
      <div className="flex items-center gap-2 font-heading font-semibold text-xl">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">R</span>
        Riven
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to see your competitor offers.</CardDescription>
        </CardHeader>
        <CardPanel>
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const message = await onSignIn(email.trim(), password);
              // On success this screen unmounts, so only update state on failure.
              if (message) {
                setError(message);
                setBusy(false);
              }
            }}
          >
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive-foreground">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardPanel>
      </Card>

      <p className="max-w-sm text-center text-muted-foreground text-sm">Accounts are created by the Riven team. There is no public sign-up.</p>
    </div>
  );
}
