import type { BetterAuthOptions } from "better-auth";

// Only server-controlled provisioning can assign a user's retailer.
export const authOptions = {
  emailAndPassword: { enabled: true, disableSignUp: true },
  user: {
    additionalFields: {
      retailerId: { type: "string", required: true, input: false, returned: false },
    },
  },
} satisfies BetterAuthOptions;
