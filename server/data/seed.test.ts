import { describe, expect, test } from "vitest";
import { assertSeedConfiguration, seedRetailers } from "./seed.js";

const validPassword = "a".repeat(20);

describe("RIV-18 seed configuration", () => {
  test("defines two separate synthetic retailers", () => {
    expect(seedRetailers).toHaveLength(2);
    expect(seedRetailers[0].retailerId).not.toBe(
      seedRetailers[1].retailerId,
    );
    expect(seedRetailers[0].productId).not.toBe(
      seedRetailers[1].productId,
    );
    expect(seedRetailers.every((entry) =>
      entry.email.endsWith("@example.test"),
    )).toBe(true);
  });

  test("accepts only the local riven_dev database", () => {
    expect(
      assertSeedConfiguration(
        "postgresql://postgres:password@127.0.0.1:5432/riven_dev",
        validPassword,
      ),
    ).toEqual({
      connectionString:
        "postgresql://postgres:password@127.0.0.1:5432/riven_dev",
      seedPassword: validPassword,
    });
  });

  test.each([
    "postgresql://postgres:password@example.com:5432/riven_dev",
    "postgresql://postgres:password@127.0.0.1:5432/riven_test",
    "postgresql://postgres:password@127.0.0.1:5433/riven_dev",
  ])("rejects an unsafe seed target: %s", (connectionString) => {
    expect(() =>
      assertSeedConfiguration(connectionString, validPassword),
    ).toThrow("only permits the local riven_dev database");
  });

  test("rejects a missing or short seed password", () => {
    expect(() =>
      assertSeedConfiguration(
        "postgresql://postgres:password@127.0.0.1:5432/riven_dev",
        "too-short",
      ),
    ).toThrow("at least 20 characters");
  });
});