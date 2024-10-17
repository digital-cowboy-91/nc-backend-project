const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");
const endpointsData = require("../endpoints.json");
const { customSort } = require("../db/seeds/utils.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api/topics", () => {
  const schema = {
    slug: expect.any(String),
    description: expect.any(String),
  };

  describe("GET", () => {
    test("Responds with 200 and array of topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then((res) => {
          const topics = res.body.topics;

          expect(topics.length).not.toBe(0);

          topics.forEach((topic) => {
            expect(topic).toEqual(expect.objectContaining(schema));
          });
        });
    });
  });
});

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
