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
    describe("Mutation", () => {
      beforeEach(seedTest);

      test("204: has no content", () => {
        return request(app)
          .delete("/api/comments/1")
          .expect(204)
          .then((res) => {
            expect(res.body).toEqual({});
          });
      });
    });

    describe("Validation", () => {
      beforeAll(seedTest);

      test("400: comment_id has invalid type", () => {
        return request(app)
          .delete("/api/comments/hello")
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Received invalid type");
          });
      });
      test("404: comment_id not found", () => {
        return request(app)
          .delete("/api/comments/999")
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("Comment not found");
          });
      });
    });
  });

  describe("PATCH", () => {
    describe("Mutation", () => {
      beforeEach(seedTest);

      test("200: has valid comment", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: 4 })
          .expect(200)
          .then((res) => {
            const { comment } = res.body;

            expect(comment).toEqual(expect.objectContaining(schema));
          });
      });

      test("200: has updated votes", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: 4 })
          .expect(200)
          .then((res) => {
            const { comment } = res.body;

            expect(comment.votes).toBe(20);
          });
      });

      test("200: does not modify any other value", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({
            inc_votes: 4,
            comment_id: 5,
            body: "Lorem ipsum",
            hello: "world",
          })
          .expect(200)
          .then((res) => {
            const { comment } = res.body;

            expect(comment.votes).toBe(20);
            expect(comment.comment_id).toBe(1);
            expect(comment.body).not.toBe("Lorem ipsum");
            expect(comment.hello).toBe(undefined);
          });
      });
    });

    describe("Validation", () => {
      beforeAll(seedTest);

      test("400: inc_votes has invalid type", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({
            inc_votes: "4",
          })
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid type of inc_votes");
          });
      });

      test("400: inc_votes is not a whole number", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({
            inc_votes: 0.8,
          })
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid type of inc_votes");
          });
      });

      test("400: inc_votes is undefined", () => {
        return request(app)
          .patch("/api/comments/1")
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid type of inc_votes");
          });
      });

      test("400: comment_id has invalid type", () => {
        return request(app)
          .patch("/api/comments/hello")
          .send({
            inc_votes: -10,
          })
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Received invalid type");
          });
      });

      test("404: comment_id not found", () => {
        return request(app)
          .patch("/api/comments/999")
          .send({
            inc_votes: -10,
          })
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("Comment not found");
          });
      });
    });
  });
});
