const request = require("supertest");
const app = require("../../../app.js");

const db = require("../../../db/connection.js");
const seed = require("../../../db/seeds/seed.js");
const testData = require("../../../db/data/test-data/index.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

const schema = {
  username: expect.any(String),
  name: expect.any(String),
  avatar_url: expect.any(String),
};

describe("/api/users", () => {
  describe("GET", () => {
    test("Responds with 200 and list of users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then((res) => {
          const { users } = res.body;

          expect(users.length).not.toBe(0);

          users.forEach((user) => {
            expect(user).toEqual(expect.objectContaining(schema));
          });
        });
    });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    test("200: responds with user", () => {
      return request(app)
        .get("/api/users/lurker")
        .expect(200)
        .then((res) => {
          const { user } = res.body;

          expect(user.username).toBe("lurker");
          expect(user).toEqual(expect.objectContaining(schema));
        });
    });

    test("404: when called with non existing username", () => {
      return request(app)
        .get("/api/users/hello")
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("User not found");
        });
    });
  });
});
