const request = require("supertest");
const app = require("../../../app.js");
const { seedTest } = require("../../../db/seeds/seed-test.js");
const db = require("../../../db/connection.js");
const { customSort } = require("../../../db/seeds/utils.js");
const { getPagination } = require("../../api.utils.js");
const users = require("../../../db/data/test-data/users.js");

afterAll(() => db.end());

const useOutputSchema = () => ({
  author: expect.any(String),
  title: expect.any(String),
  article_id: expect.any(Number),
  body: expect.any(String),
  topic: expect.any(String),
  created_at: expect.any(String),
  votes: expect.any(Number),
  article_img_url: expect.any(String),
  comment_count: expect.any(Number),
});

describe("/api/articles", () => {
  describe("GET", () => {
    beforeAll(seedTest);

    describe("Defaults", () => {
      let data;

      test("200: responds with some data", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then((res) => {
            data = res.body;
          });
      });

      test("data has [articles] with 5 valid items", () => {
        const { articles } = data;

        const schema = useOutputSchema();
        delete schema.body;

        expect(articles.length).toBe(5);

        articles.forEach((article) => {
          expect(article).toEqual(expect.objectContaining(schema));
        });
      });

      test("[articles] are sorted by [created_at] in descending order", () => {
        const { articles } = data;

        expect(customSort(articles, "created_at", "DESC", "time")).toBe(true);
      });

      test("data has [pagination] with valid items", () => {
        const { pagination } = data;

        expect(pagination).toEqual(getPagination(13, 5, 0));
      });
    });

    describe("Queries", () => {
      describe("sort_by: defaults to 'created_at'", () => {
        test.each([
          "created_at",
          "article_id",
          "title",
          "topic",
          "author",
          "votes",
        ])(
          "200: articles are sorted by [%s] in descending order",
          async (column) => {
            const convertTo = column === "created_at" ? "time" : undefined;

            return request(app)
              .get(`/api/articles?sort_by=${column}`)
              .expect(200)
              .then((res) => {
                const { articles } = res.body;

                expect(customSort(articles, column, "DESC", convertTo)).toBe(
                  true
                );
              });
          }
        );

        test.each(["ANY", 100, undefined])(
          "400: invalid sorted_by for [%s] value",
          (column) => {
            return request(app)
              .get(`/api/articles?sort_by=${column}`)
              .expect(400)
              .then((res) => {
                expect(res.body.msg).toBe("Invalid sort_by query");
              });
          }
        );
      });

      describe("order: defaults to 'DESC'", () => {
        test.each([
          ["created_at", "ASC"],
          ["article_id", "asc"],
          ["title", "DESC"],
          ["topic", "desc"],
        ])(
          "200: articles are sorted by [%s] in [%s] order",
          async (column, order) => {
            const convertTo = column === "created_at" ? "time" : undefined;

            return request(app)
              .get(`/api/articles?sort_by=${column}&order=${order}`)
              .expect(200)
              .then((res) => {
                const { articles } = res.body;

                expect(customSort(articles, column, order, convertTo)).toBe(
                  true
                );
              });
          }
        );

        test.each(["ANY", 100, undefined])(
          "400: invalid order for [%s]",
          (order) => {
            return request(app)
              .get(`/api/articles?order=${order}`)
              .expect(400)
              .then((res) => {
                expect(res.body.msg).toBe("Invalid order query");
              });
          }
        );
      });

      describe("topic", () => {
        test.each([
          ["cats", 1],
          ["mitch", 5],
        ])("200: articles are filtered by [%s]", (topicName, num) => {
          return request(app)
            .get(`/api/articles?topic=${topicName}`)
            .expect(200)
            .then((res) => {
              const { articles } = res.body;

              expect(articles).toHaveLength(num);
              articles.forEach(({ topic }) => {
                expect(topic).toBe(topicName);
              });
            });
        });

        test.each(["ANY", 100, undefined])(
          "400: invalid topic for [%s]",
          (topicName) => {
            return request(app)
              .get(`/api/articles?topic=${topicName}`)
              .expect(400)
              .then((res) => {
                expect(res.body.msg).toBe("Invalid topic query");
              });
          }
        );
      });

      describe("limit: defaults to 5", () => {
        test.each([
          ["ANY", 5],
          [undefined, 5],
          [true, 5],
          [-1, 5],
          [0, 5],
          [1, 1],
          [2.8, 2],
          [3, 3],
          [7, 7],
          [10, 10],
          [20.1, 10],
          [99, 10],
        ])("200: input [%s] gives [%s] articles", (input, length) => {
          return request(app)
            .get(`/api/articles?limit=${input}`)
            .expect(200)
            .then((res) => {
              const { articles } = res.body;

              expect(articles).toHaveLength(length);
            });
        });
      });

      describe("page: defaults to 1", () => {
        test.each([
          [1, 3, 1],
          [2, 3, 4],
          [3, 3, 7],
          [4, 3, 10],
          [5, 1, 13],
        ])(
          "200: page [%s] has [%s] items starting with id [%s]",
          (page, length, firstId) => {
            return request(app)
              .get(
                `/api/articles?sort_by=article_id&order=ASC&limit=3&page=${page}`
              )
              .expect(200)
              .then((res) => {
                const { articles } = res.body;

                expect(articles).toHaveLength(length);

                articles.forEach(({ article_id }, index) => {
                  expect(article_id).toBe(index + firstId);
                });
              });
          }
        );
      });
    });

    describe("Pagination", () => {
      test.each([
        [
          1,
          1,
          {
            total_count: 13,
            current_page: 1,
            total_pages: 13,
            next_page: 2,
            prev_page: null,
          },
        ],
        [
          5,
          2,
          {
            total_count: 13,
            current_page: 2,
            total_pages: 3,
            next_page: 3,
            prev_page: 1,
          },
        ],
        [
          3,
          5,
          {
            total_count: 13,
            current_page: 5,
            total_pages: 5,
            next_page: null,
            prev_page: 4,
          },
        ],
      ])(
        "200: limit [%s] and page [%s] gives valid object [%o]",
        (limit, page, expected) => {
          return request(app)
            .get(`/api/articles?limit=${limit}&page=${page}`)
            .expect(200)
            .then((res) => {
              const { pagination } = res.body;

              expect(pagination).toEqual(expected);
            });
        }
      );
    });
  });

  describe("POST", () => {
    const useMandatory = () => ({
      author: "lurker",
      title: "Hello World",
      body: "Lorem ipsum dolor sit amet.",
      topic: "mitch",
    });

    const useOptional = () => ({
      article_img_url: "https://hello-world.co.uk/some/random/img.jpg",
    });

    const useExtra = () => ({
      article_id: 999,
      hello: "world",
    });

    describe("Mutation", () => {
      beforeAll(seedTest);

      let data;

      test("201: responds with some data", () => {
        return request(app)
          .post("/api/articles")
          .send({
            ...useMandatory(),
            ...useOptional(),
            ...useExtra(),
          })
          .expect(201)
          .then((res) => (data = res.body));
      });

      test("data has newly created [article] item", () => {
        const { article } = data;

        expect(article).toEqual(useOutputSchema());
        expect(article).toMatchObject({
          ...useMandatory(),
          ...useOptional(),
        });
      });

      test("ignores extra properties", () => {
        const { article } = data;

        expect(article.article_id).not.toBe(useExtra().article_id);
        expect(article.hello).toBe(undefined);
      });
    });

    describe("Validation", () => {
      beforeAll(seedTest);

      test.each([
        [{ author: 1 }, "Invalid type of author"],
        [{ author: "hello" }, "Received invalid reference value"],
        [{ title: 1 }, "Invalid type of title"],
        [{ body: 1 }, "Invalid type of body"],
        [{ topic: 1 }, "Invalid type of topic"],
        [{ topic: "hello" }, "Received invalid reference value"],
      ])("400: [%s] responds with [%s]", (element, msg) => {
        const payload = useMandatory();

        return request(app)
          .post("/api/articles")
          .send({
            ...payload,
            ...element,
          })
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe(msg);
          });
      });

      test.each([{ article_img_url: undefined }, { article_img_url: 1 }])(
        "201: [%s] defaults to 'https://default.co.uk/some/random/img.jpg'",
        (element) => {
          const payload = useMandatory();

          return request(app)
            .post("/api/articles")
            .send({ ...payload, ...element })
            .expect(201)
            .then((res) => {
              const { article } = res.body;

              expect(article.article_img_url).toBe(
                "https://default.co.uk/some/random/img.jpg"
              );
            });
        }
      );
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    beforeAll(seedTest);

    test("200: responds with a valid article", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then((res) => {
          const { article } = res.body;

          expect(article).toEqual(useOutputSchema());
        });
    });

    test.each([
      [400, "hello", "Received invalid type"],
      [404, 999, "Article does not exist"],
    ])("%s: id [%s] responds with [%s]", (code, id, msg) => {
      return request(app)
        .get(`/api/articles/${id}`)
        .expect(code)
        .then((res) => {
          expect(res.body.msg).toBe(msg);
        });
    });
  });

  describe("PATCH", () => {
    beforeAll(seedTest);

    describe("Mutation", () => {
      test.each([
        [1, 10, 110],
        [2, -10, -10],
        [2, 13, 3],
      ])(
        "200: article [%s] votes change by [%s] to [%s]",
        (articleId, inc_votes, expected) => {
          return request(app)
            .patch(`/api/articles/${articleId}`)
            .send({ inc_votes })
            .expect(200)
            .then((res) => {
              const { article } = res.body;

              expect(article.votes).toBe(expected);
            });
        }
      );

      test("200: does not update other fields", () => {
        const payload = {
          article_id: 1,
          author: "lorem",
          title: "lorem",
          body: "Lorem ipsum dolor sit amet.",
          topic: "lorem",
          article_img_url: "https://hello-world.co.uk/some/random/img.jpg",
        };

        return request(app)
          .patch(`/api/articles/3`)
          .send({
            ...payload,
            inc_votes: 10,
          })
          .expect(200)
          .then((res) => {
            const { article } = res.body;

            expect(article.votes).toBe(10);

            Object.entries(payload).forEach(([key, val]) => {
              expect(article[key]).not.toBe(val);
            });
          });
      });
    });

    describe("Validation", () => {
      describe("inc_votes", () => {
        test.each([
          ["hello", "Element 'inc_votes' has invalid type"],
          [0.5, "Invalid 'inc_votes', expected whole number"],
        ])("400: value [%s] responds with [%s]", (inc_votes, msg) => {
          return request(app)
            .patch(`/api/articles/1`)
            .send({ inc_votes })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });

      describe("article_id", () => {
        test.each([
          [400, "hello", "Received invalid type"],
          [404, 999, "Article does not exist"],
        ])("%s: id [%s] responds with [%s]", (code, id, msg) => {
          return request(app)
            .get(`/api/articles/${id}`)
            .expect(code)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });
    });
  });

  describe("DELETE", () => {
    beforeAll(seedTest);

    describe("Mutation", () => {
      test("204: has no content", () => {
        return request(app)
          .delete("/api/articles/1")
          .expect(204)
          .then((res) => {
            expect(res.body).toEqual({});
          });
      });
    });

    describe("Validation", () => {
      describe("article_id", () => {
        test.each([
          [400, "hello", "Received invalid type"],
          [404, 999, "Article does not exist"],
        ])("%s: id [%s] responds with [%s]", (code, id, msg) => {
          return request(app)
            .get(`/api/articles/${id}`)
            .expect(code)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  const outputSchema = {
    comment_id: expect.any(Number),
    votes: expect.any(Number),
    created_at: expect.any(String),
    author: expect.any(String),
    body: expect.any(String),
    article_id: expect.any(Number),
  };

  describe("GET", () => {
    beforeAll(seedTest);

    describe("Default", () => {
      let data;

      test("200: responds with some data", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then((res) => (data = res.body));
      });

      test("data has [comments] with list of valid items", () => {
        const { comments } = data;

        expect(comments).toHaveLength(5);

        comments.forEach((comment) => {
          expect(comment).toEqual(expect.objectContaining(outputSchema));

          expect(comment.article_id).toBe(1);
        });
      });

      test("[comments] are sorted by date in descending order", () => {
        const { comments } = data;

        expect(customSort(comments, "created_at", "DESC", "time")).toBe(true);
      });

      test("200: responds with empty [comments] if article has no comments", () => {
        return request(app)
          .get("/api/articles/2/comments")
          .expect(200)
          .then((res) => {
            const { comments } = res.body;

            expect(comments.length).toBe(0);
          });
      });
    });

    describe("Validation", () => {
      describe("article_id", () => {
        test.each([
          [400, "hello", "Received invalid type"],
          [404, 999, "Article does not exist"],
        ])("%s: id [%s] responds with [%s]", (code, id, msg) => {
          return request(app)
            .get(`/api/articles/${id}/comments`)
            .expect(code)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });
    });

    describe("Queries", () => {
      describe("limit - defaults to 5", () => {
        test.each([
          ["", 5],
          [-1, 5],
          [0, 5],
          [2.8, 2],
          [7, 7],
          [10, 10],
          [99, 10],
        ])("200: value [%s] gives [%s] comments", (value, expected) => {
          return request(app)
            .get(`/api/articles/1/comments?limit=${value}`)
            .expect(200)
            .then((res) => {
              const { comments } = res.body;

              expect(comments).toHaveLength(expected);
            });
        });
      });

      describe("page - defaults to 1", () => {
        const articleOneCommentIds = [5, 2, 18, 13, 7, 8, 6, 12, 3, 4, 9];

        const p1 = articleOneCommentIds.slice(0, 5);
        const p2 = articleOneCommentIds.slice(5, 10);
        const p3 = articleOneCommentIds.slice(10);

        test.each([
          [undefined, p1],
          ["hello", p1],
          ["", p1],
          [1, p1],
          [2, p2],
          [2.5, p2],
          [3, p3],
          [4, []],
        ])("200: page [%s] has items with ids %s", (page, ids) => {
          return request(app)
            .get(`/api/articles/1/comments?page=${page}`)
            .expect(200)
            .then((res) => {
              const { comments } = res.body;

              expect(comments.map(({ comment_id }) => comment_id)).toEqual(ids);
            });
        });
      });
    });

    describe("Pagination", () => {
      test.each([
        [
          1,
          1,
          {
            total_count: 11,
            current_page: 1,
            total_pages: 11,
            next_page: 2,
            prev_page: null,
          },
        ],
        [
          5,
          2,
          {
            total_count: 11,
            current_page: 2,
            total_pages: 3,
            next_page: 3,
            prev_page: 1,
          },
        ],
        [
          3,
          4,
          {
            total_count: 11,
            current_page: 4,
            total_pages: 4,
            next_page: null,
            prev_page: 3,
          },
        ],
      ])(
        "200: limit [%s] and page [%s] gives valid object [%o]",
        (limit, page, expected) => {
          return request(app)
            .get(`/api/articles/1/comments?limit=${limit}&page=${page}`)
            .expect(200)
            .then((res) => {
              const { pagination } = res.body;

              expect(pagination).toEqual(expected);
            });
        }
      );
    });
  });

  describe("POST", () => {
    const useMandatory = () => ({
      username: "lurker",
      body: "Lorem ipsum dolor sit amet.",
    });

    const useExtra = () => ({
      article_id: 999,
      comment_id: 999,
      hello: "world",
    });

    describe("Mutation", () => {
      beforeAll(seedTest);

      let data;

      test("201: responds with some data", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send({
            ...useMandatory(),
            ...useExtra(),
          })
          .expect(201)
          .then((res) => (data = res.body));
      });

      test("data has [comment] with valid elements", () => {
        const { comment } = data;
        const { username, body } = useMandatory();

        expect(comment).toEqual(expect.objectContaining(outputSchema));
        expect(comment.author).toBe(username);
        expect(comment.body).toBe(body);
      });

      test("ignores extra properties", () => {
        const { comment } = data;
        const { article_id, comment_id, hello } = useExtra();

        expect(comment.article_id).not.toBe(article_id);
        expect(comment.comment_id).not.toBe(comment_id);
        expect(comment.hello).toBeUndefined();
      });
    });

    describe("Validation", () => {
      beforeAll(seedTest);

      describe("body", () => {
        test.each([
          [400, true, "Element 'body' has wrong type"],
          [400, "", "Element 'body' is too short"],
        ])("%s: value [%s] responds with [%s]", (code, body, msg) => {
          return request(app)
            .post(`/api/articles/1/comments`)
            .send({
              ...useMandatory,
              body,
            })
            .expect(code)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });

      describe("username", () => {
        test.each([
          [400, 1, "Element 'username' has wrong type"],
          [400, "hello", "Received invalid reference value"],
        ])("%s: value [%s] responds with [%s]", (code, username, msg) => {
          return request(app)
            .post(`/api/articles/1/comments`)
            .send({
              ...useMandatory(),
              username,
            })
            .expect(code)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });

      describe("article_id", () => {
        test.each([
          [400, "hello", "Received invalid type"],
          [404, 999, "Article does not exist"],
        ])("%s: value [%s] responds with [%s]", (code, id, msg) => {
          return request(app)
            .post(`/api/articles/${id}/comments`)
            .send({
              ...useMandatory(),
            })
            .expect(code)
            .then((res) => {
              expect(res.body.msg).toBe(msg);
            });
        });
      });
    });
  });
});
