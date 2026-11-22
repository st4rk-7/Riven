import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { test, type Retailer } from "./retailer-fixtures";

async function submitSignIn(page: Page, origin: string, email: string, password: string) {
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  await page.goto("/app");
  await page.getByLabel("Email", { exact: true }).fill(email);
  try {
    await page.getByLabel("Password", { exact: true }).fill(password);
  } catch {
    throw new Error("Could not fill the synthetic password field.");
  }

  const [response] = await Promise.all([
    page.waitForResponse((res) =>
      res.request().method() === "POST" && new URL(res.url()).pathname === "/api/v1/auth/sign-in"),
    page.getByRole("button", { name: "Sign in", exact: true }).click(),
  ]);
  return response;
}

function productOnScreen(page: Page, retailer: Retailer) {
  return page.getByText(retailer.productName, { exact: true });
}

test("AT-001 valid sign-in persists across a page refresh", async ({ page, baseURL, createRetailer }, info) => {
  const retailer = await createRetailer("Alpha");
  const response = await submitSignIn(page, baseURL!, retailer.email, retailer.password);
  expect(response.status()).toBe(200);
  const cookies = await response.headerValues("set-cookie");
  expect(cookies.some((cookie) => /;\s*HttpOnly(?:;|$)/i.test(cookie))).toBe(true);
  await expect(productOnScreen(page, retailer)).toBeVisible();

  await page.reload();
  await expect(productOnScreen(page, retailer)).toBeVisible();
  const identity = await page.request.get("/api/v1/auth/me");
  expect(identity.status()).toBe(200);
  expect((await identity.json()).retailer.id).toBe(retailer.retailerId);
  await page.screenshot({ path: info.outputPath("signed-in.png") });
});

test("AT-002 wrong credentials leave the browser signed out", async ({ page, baseURL, createRetailer }) => {
  const retailer = await createRetailer("Alpha");
  const response = await submitSignIn(page, baseURL!, retailer.email, randomUUID());
  expect(response.status()).toBe(401);
  await expect(page.getByRole("alert")).toHaveText("Email or password is incorrect.");
  expect((await page.request.get("/api/v1/products")).status()).toBe(401);
});

test("AT-003 each retailer sees only their own products", async ({ page, browser, baseURL, createRetailer }) => {
  const alpha = await createRetailer("Alpha");
  const beta = await createRetailer("Beta");
  const betaContext = await browser.newContext({ baseURL, serviceWorkers: "block" });

  try {
    const betaPage = await betaContext.newPage();
    for (const [retailerPage, own, other] of [
      [page, alpha, beta],
      [betaPage, beta, alpha],
    ] as const) {
      const response = await submitSignIn(retailerPage, baseURL!, own.email, own.password);
      expect(response.status()).toBe(200);
      await expect(productOnScreen(retailerPage, own)).toBeVisible();
      await expect(productOnScreen(retailerPage, other)).toHaveCount(0);
      const products = await retailerPage.request.get("/api/v1/products");
      expect(products.status()).toBe(200);
      expect((await products.json()).products.map((product: { id: string }) => product.id))
        .toEqual([own.productId]);
    }
  } finally {
    await betaContext.close();
  }
});

test("AT-004 signed-out and logged-out browsers cannot access products", async ({ page, baseURL, createRetailer }) => {
  const retailer = await createRetailer("Alpha");
  expect((await page.request.get("/api/v1/products")).status()).toBe(401);
  const response = await submitSignIn(page, baseURL!, retailer.email, retailer.password);
  expect(response.status()).toBe(200);
  await expect(productOnScreen(page, retailer)).toBeVisible();
  expect((await page.request.get("/api/v1/products")).status()).toBe(200);

  const [signOut] = await Promise.all([
    page.waitForResponse((res) =>
      res.request().method() === "POST" && new URL(res.url()).pathname === "/api/v1/auth/sign-out"),
    page.getByTitle("Sign out", { exact: true }).click(),
  ]);
  expect(signOut.status()).toBe(204);
  expect((await page.request.get("/api/v1/products")).status()).toBe(401);
  await page.reload();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  await expect(productOnScreen(page, retailer)).toHaveCount(0);
});
