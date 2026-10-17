import { Button } from "@coss/ui/components/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@coss/ui/components/card";
import { Field, FieldLabel } from "@coss/ui/components/field";
import { Input } from "@coss/ui/components/input";

export function SignIn({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 px-4">
      <div className="flex items-center gap-2 font-heading font-semibold text-xl">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">R</span>
        Riven
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to see your competitors' prices.</CardDescription>
        </CardHeader>
        <CardPanel>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              onSignIn();
            }}
          >
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" placeholder="you@shop.com" />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" placeholder="Your password" />
            </Field>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </CardPanel>
      </Card>

      <p className="text-muted-foreground text-sm">Competitor price and stock tracking for online retailers</p>
    </div>
  );
}
