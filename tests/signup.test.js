const express = require("express");
const request = require("supertest");
const getTestUser = require("./testUser");

const app = express();
app.post("/api/users/login", getTestUser);

describe("test user login", () => {
  let server;
  beforeAll(() => (server = app.listen(3000)));
  afterAll(() => server.close());

  test("POST /login", async () => {
    const res = await request(app).post("/api/users/login");

    const [testUser] = res.body;
    const { email, subscription } = testUser.data.user;

    expect(res.statusCode).toBe(200);
    expect(typeof email).toBe("string");
    expect(typeof subscription).toBe("string");
    expect(testUser.data.token).toBe("token");
  });
});
