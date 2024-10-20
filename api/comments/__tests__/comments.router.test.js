const request = require("supertest");
const app = require("../../../app.js");
const db = require("../../../db/connection.js");
const { seedTest } = require("../../../db/seeds/seed-test.js");

afterAll(() => db.end());

const schema = {
  comment_id: expect.any(Number),
  body: expect.any(String),
  article_id: expect.any(Number),
  author: expect.any(String),
  votes: expect.any(Number),
  created_at: expect.any(String),
};

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    beforeAll(seedTest);

    describe("Mutation", () => {
      test("204: responds with no content", () => {
        return request(app)
          .delete("/api/comments/1")
          .expect(204)
          .then((res) => {
            expect(res.body).toEqual({});
          });
      });
    });

    describe("Validation", () => {
      describe("comment_id", () => {
        test.each([
          [400, "hello", "Received invalid type"],
          [404, 999, "Comment not found"],
        ])("%s: value [%s] responds with [%s]", (code, id, msg) => {
          return request(app)
            .delete(`/api/comments/${id}`)
            .expect(code)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });
    });
  });

  describe("PATCH", () => {
    beforeAll(seedTest);

    describe("Mutation", () => {
      let data;

      test("200: responds with some data", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({
            inc_votes: 4,
            comment_id: 5,
            body: "Lorem ipsum",
            hello: "world",
          })
          .expect(200)
          .then((res) => (data = res.body));
      });

      test("data has [comment] with valid elements", () => {
        const { comment } = data;

        expect(comment).toEqual(expect.objectContaining(schema));
      });

      test("element [votes] is increased by [4] to [20]", () => {
        const { comment } = data;

        expect(comment.votes).toBe(20);
      });

      test("does not modify any other elements", () => {
        const { comment } = data;

        expect(comment.comment_id).not.toBe(5);
        expect(comment.body).not.toBe("Lorem ipsum");
        expect(comment.hello).toBeUndefined();
      });
    });

    describe("Validation", () => {
      describe("inc_votes", () => {
        test.each([
          ["hello", "Invalid type of inc_votes"],
          [0.5, "Invalid type of inc_votes"],
        ])("400: value [%s] responds with [%s]", (inc_votes, msg) => {
          return request(app)
            .patch(`/api/comments/1`)
            .send({ inc_votes })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });

      describe("comment_id", () => {
        test.each([
          [400, "hello", "Received invalid type"],
          [404, 999, "Comment not found"],
        ])("%s: id [%s] responds with [%s]", (code, id, msg) => {
          return request(app)
            .patch(`/api/comments/${id}`)
            .send({ inc_votes: 4 })
            .expect(code)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });
    });
  });
});
