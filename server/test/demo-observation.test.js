const app = require("../index");

test("GET /api/v1/demo-observation returns synthetic observation", async () => {
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/demo-observation",
  });

  expect(response.statusCode).toBe(200);

  const body = JSON.parse(response.body);

  expect(body.mode).toBe("synthetic");

  expect(typeof body.productName).toBe("string");

  expect(body.price === null || typeof body.price === "string").toBe(true);

  expect(typeof body.currency).toBe("string");
  expect(typeof body.availability).toBe("string");
  expect(typeof body.source).toBe("string");
  expect(typeof body.observedAt).toBe("string");
  expect(typeof body.matchStatus).toBe("string");
});