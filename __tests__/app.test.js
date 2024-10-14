const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api/healthCheck", () => {
  describe("GET", () => {
    test("Responds with 200 and alive message", () => {
      return request(app)
        .get("/api/healthCheck")
        .expect(200)
        .then((res) => {
          expect(res.body.msg).toBe("Alive!");
        });
    });
  });
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("Responds with 200 and array of topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then((res) => {
          const topics = res.body.topics;

          expect(topics.length).not.toBe(0);

          topics.forEach((topic) => {
            expect(topic).toEqual(
              expect.objectContaining({
                slug: expect.any(String),
                description: expect.any(String),
              })
            );
          });
        });
    });
  });
});
