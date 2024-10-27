const request = require("supertest");
const app = require("../../app.js");
const db = require("../../db/connection.js");
const { seedTest } = require("../../db/seeds/seed-test.js");

afterAll(() => db.end());

describe("/api/topics", () => {
  const schema = {
    slug: expect.any(String),
    description: expect.any(String),
  };

  describe("GET", () => {
    beforeAll(seedTest);

    describe("Default", () => {
      let data;

      test("200: responds with some data", () => {
        return request(app)
          .get("/api/topics")
          .expect(200)
          .then((res) => (data = res.body));
      });

      test("data has [topics] with [3] valid items", () => {
        const { topics } = data;

        expect(topics.length).toBe(3);

        topics.forEach((topic) => {
          expect(topic).toEqual(expect.objectContaining(schema));
        });
      });
    });
  });

  describe("POST", () => {
    beforeAll(seedTest);

    describe("Mutation", () => {
      let data;

      const mandatory = {
        slug: "hello",
        description: "description here",
      };

      const extra = {
        lorem: "ipsum",
      };

      test("201: responds with some data", () => {
        return request(app)
          .post("/api/topics")
          .send({
            ...mandatory,
            ...extra,
          })
          .expect(201)
          .then((res) => (data = res.body));
      });

      test("data has [topic] element with newly created topic", () => {
        const { topic } = data;

        expect(topic).toEqual(mandatory);
      });

      test("ignores other elements", () => {
        const { topic } = data;

        expect(topic.lorem).toBeUndefined();
      });
    });

    describe("Validation", () => {
      describe("slug", () => {
        test.each([
          [undefined, "Invalid type of slug"],
          ["Hello World", "Invalid format of slug"],
        ])("400: value [%s] responds with [%s]", (slug, msg) => {
          return request(app)
            .post("/api/topics")
            .send({
              description: "Lorem ipsum dolor sit amet.",
              slug,
            })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });

      describe("description", () => {
        test.each([
          [undefined, "Invalid type of description"],
          [100, "Invalid type of description"],
        ])("400: value [%s] responds with [%s]", (description, msg) => {
          return request(app)
            .post("/api/topics")
            .send({
              slug: "lorem",
              description,
            })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });
    });
  });
});
