const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const { seedTest } = require("../db/seeds/seed-test.js");

beforeAll(seedTest);
afterAll(() => db.end());

const schema = {
  username: expect.any(String),
  name: expect.any(String),
  avatar_url: expect.any(String),
};

describe("/api/users", () => {
  describe("GET", () => {
    describe("Default", () => {
      test("200: responds with list of users", () => {
        return request(app)
          .get("/api/users")
          .expect(200)
          .then((res) => {
            const { users } = res.body;

            expect(users.length).toBe(4);

            users.forEach((user) => {
              expect(user).toEqual(expect.objectContaining(schema));
            });
          });
      });
    });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    describe("Default", () => {
      test("200: responds with [user]", () => {
        return request(app)
          .get("/api/users/lurker")
          .expect(200)
          .then((res) => {
            const { user } = res.body;

            expect(user.username).toBe("lurker");
            expect(user).toEqual(expect.objectContaining(schema));
          });
      });
    });

    describe("Validation", () => {
      describe("username", () => {
        test.each([
          [404, "hello", "User not found"],
          [404, 999, "User not found"],
        ])("%s: value [%s] responds with [%s]", (code, username, msg) => {
          return request(app)
            .get(`/api/users/${username}`)
            .expect(code)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });
    });
  });
});
