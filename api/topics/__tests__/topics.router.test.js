const request = require("supertest");
const app = require("../../../app.js");
const db = require("../../../db/connection.js");
const { seedTest } = require("../../../db/seeds/seed-test.js");

afterAll(() => db.end());

describe("/api/topics", () => {
  const schema = {
    slug: expect.any(String),
    description: expect.any(String),
  };

  describe("GET", () => {
    beforeAll(seedTest);

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
    describe("Mutation", () => {
      beforeEach(seedTest);

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
    });

    describe("Validation", () => {
      beforeAll(seedTest);

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
