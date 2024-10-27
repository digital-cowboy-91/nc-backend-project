const request = require("supertest");
const app = require("../../app.js");
const db = require("../../db/connection.js");
const endpointsData = require("../../endpoints.json");
const { seedTest } = require("../../db/seeds/seed-test.js");

afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
    beforeAll(seedTest);

    test("Responds with 200 and available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then((res) => {
          expect(res.body.endpoints).toEqual(endpointsData);
        });
    });
  });
});
