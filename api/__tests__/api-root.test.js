const request = require("supertest");
const app = require("../../app.js");
const db = require("../../db/connection.js");
const seed = require("../../db/seeds/seed.js");
const testData = require("../../db/data/test-data/index.js");
const endpointsData = require("../../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
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
