const request = require("supertest");
const app = require("../../../app.js");

const db = require("../../../db/connection.js");
const seed = require("../../../db/seeds/seed.js");
const testData = require("../../../db/data/test-data/index.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api/topics", () => {
  const schema = {
    slug: expect.any(String),
    description: expect.any(String),
  };

  describe("GET", () => {
    test("200: has list of topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then((res) => {
          const { topics } = res.body;

          expect(topics.length).not.toBe(0);

          topics.forEach((topic) => {
            expect(topic).toEqual(expect.objectContaining(schema));
          });
        });
    });
  });

  describe("POST", () => {
    test("201: has created topic", () => {
      const payload = {
        slug: "hello",
        description: "description here",
      };

      return request(app)
        .post("/api/topics")
        .send(payload)
        .expect(201)
        .then((res) => {
          const { topic } = res.body;

          expect(topic).toEqual(payload);
        });
    });

    test("201: ignores other elements", () => {
      const payload = {
        slug: "hello",
        description: "description here",
        lorem: "ipsum",
      };

      return request(app)
        .post("/api/topics")
        .send(payload)
        .expect(201)
        .then((res) => {
          const { topic } = res.body;

          expect(topic.lorem).toBe(undefined);
        });
    });

    describe("Validation", () => {
      describe("element slug", () => {
        test("400:undefined = invalid type", () => {
          const payload = {
            description: "description here",
          };

          return request(app)
            .post("/api/topics")
            .send(payload)
            .expect(400)
            .then((res) => {
              const { msg } = res.body;

              expect(msg).toBe("Invalid type of slug");
            });
        });

        test("400:'Hello World' = invalid format", () => {
          const payload = {
            slug: "Hello World",
            description: "description here",
          };

          return request(app)
            .post("/api/topics")
            .send(payload)
            .expect(400)
            .then((res) => {
              const { msg } = res.body;

              expect(msg).toBe("Invalid format of slug");
            });
        });
      });

      describe("element description", () => {
        test("400:undefined = invalid type", () => {
          const payload = {
            slug: "hello",
          };

          return request(app)
            .post("/api/topics")
            .send(payload)
            .expect(400)
            .then((res) => {
              const { msg } = res.body;

              expect(msg).toBe("Invalid type of description");
            });
        });
      });
    });
  });
});
