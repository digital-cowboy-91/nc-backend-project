const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");
const endpointsData = require("../endpoints.json");

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

describe("/api/articles/:article_id", () => {
  const base = "/api/articles/";

  describe("GET", () => {
    test("Responds with 200 and single article", () => {
      return request(app)
        .get(base + 1)
        .expect(200)
        .then((res) => {
          const article = res.body.article;

          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              body: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
            })
          );
        });
    });

    test("Responds with 400 and msg object when received invalid id type", () => {
      return request(app)
        .get(base + "hello_world")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Received invalid type");
        });
    });

    test("Responds with 404 and msg object when received non existing id", () => {
      return request(app)
        .get(base + 10000)
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Article does not exist");
        });
    });
  });
});
