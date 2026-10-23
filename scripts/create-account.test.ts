import { describe, expect, it } from "vitest";
import { accountInput } from "./create-account.js";

describe("accountInput", () => {
  it("normalises the email and defaults the name to the retailer", () => {
    expect(accountInput(["--retailer", " Corner Shop ", "--email", "Owner@Shop.co.uk"], "long-enough-password"))
      .toEqual({ retailer: "Corner Shop", email: "owner@shop.co.uk", name: "Corner Shop", password: "long-enough-password" });
  });

  it("rejects a missing retailer, a bad email and a short password", () => {
    expect(() => accountInput(["--email", "a@b.co"], "long-enough-password")).toThrow("--retailer");
    expect(() => accountInput(["--retailer", "Shop", "--email", "not-an-email"], "long-enough-password")).toThrow("--email");
    expect(() => accountInput(["--retailer", "Shop", "--email", "a@b.co"], "short")).toThrow("RIVEN_ACCOUNT_PASSWORD");
  });
});
