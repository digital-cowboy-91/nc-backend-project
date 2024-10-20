const request = require("supertest");
const app = require("../../../app.js");
const { seedTest } = require("../../../db/seeds/seed-test.js");
const db = require("../../../db/connection.js");
const { customSort } = require("../../../db/seeds/utils.js");
const { getPagination } = require("../../api.utils.js");

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

    test("Responds with 200 and single article", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then((res) => {
          const { article } = res.body;

          expect(article).toEqual(useOutputSchema());
        });
    });

    test("Responds with 400 and msg object when received invalid id type", () => {
      return request(app)
        .get("/api/articles/hello_world")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Received invalid type");
        });
    });

    test("Responds with 404 and msg object when received non existing id", () => {
      return request(app)
        .get("/api/articles/999")
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Article does not exist");
        });
    });
  });

  describe("PATCH", () => {
    const getArticleById = (id) =>
      request(app)
        .get("/api/articles/" + id)
        .then((res) => res.body.article);

    describe("Mutation", () => {
      beforeEach(seedTest);

      test("Responds with 200 and updated article", () => {
        let originalArticle;

        const newVote = -10;

        return getArticleById(1)
          .then((article) => {
            article.votes += newVote;
            originalArticle = article;

            return request(app)
              .patch("/api/articles/1")
              .send({ inc_votes: newVote })
              .expect(200);
          })
          .then((res) => {
            const { article: patchedArticle } = res.body;

            expect(originalArticle).toEqual(patchedArticle);
          });
      });

      test("Does not update other fields", () => {
        let originalArticle;

        const newVote = 10;

        return getArticleById(1)
          .then((article) => {
            article.votes += newVote;
            originalArticle = article;

            return request(app)
              .patch("/api/articles/1")
              .send({ inc_votes: newVote, article_id: 0, title: "Hello" })
              .expect(200);
          })
          .then((res) => {
            const { article: patchedArticle } = res.body;

            expect(originalArticle).toEqual(patchedArticle);
          });
      });
    });

    describe("Validation", () => {
      beforeAll(seedTest);

      describe("element inc_votes", () => {
        test("Responds with 400 when inc_votes is of wrong type", () => {
          return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: "hello", article_id: 0, title: "Hello" })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Element 'inc_votes' has invalid type");
            });
        });

        test("Responds with 400 when inc_votes is not whole number", () => {
          return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: 0.8 })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe(
                "Invalid 'inc_votes', expected whole number"
              );
            });
        });
      });

      describe("element article_id", () => {
        test("Responds with 400 when received invalid id type", () => {
          return request(app)
            .patch("/api/articles/hello")
            .send({ inc_votes: 10 })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Received invalid type");
            });
        });

        test("Responds with 404 when received non existing id", () => {
          return request(app)
            .patch("/api/articles/999")
            .send({ inc_votes: 10 })
            .expect(404)
            .then((res) => {
              expect(res.body.msg).toBe("Article does not exist");
            });
        });
      });
    });
  });

  describe("DELETE", () => {
    describe("Mutation", () => {
      beforeEach(seedTest);

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
      beforeAll(seedTest);

      test("400: article_id has invalid type", () => {
        return request(app)
          .delete("/api/articles/hello")
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Received invalid type");
          });
      });
      test("404: article_id not found", () => {
        return request(app)
          .delete("/api/articles/999")
          .expect(404)
          .then((res) => {
            expect(res.body.msg).toBe("Article not found");
          });
      });
    });
  });
});

xdescribe("/api/articles/:article_id/comments", () => {
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

    test("Responds with 200 and list of comments", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then((res) => {
          const { comments } = res.body;

          expect(comments.length).not.toBe(0);

          comments.forEach((comment) => {
            expect(comment).toEqual(expect.objectContaining(outputSchema));
          });
        });
    });

    test("Responds with 200 and an empty array if article has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then((res) => {
          const { comments } = res.body;

          expect(comments.length).toBe(0);
        });
    });

    test("Comments are ordered by date in descending order", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then((res) => {
          const { comments } = res.body;

          comments.reduce((prevDate, { created_at }) => {
            const thisDate = new Date(created_at).getTime();

            expect(prevDate >= thisDate).toBe(true);

            return thisDate;
          }, Infinity);
        });
    });

    test("Responds with 400 and msg object when received invalid id type", () => {
      return request(app)
        .get("/api/articles/hello/comments")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Received invalid type");
        });
    });

    test("Responds with 404 and msg object when received non existing id", () => {
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Article does not exist");
        });
    });

    describe("Queries", () => {
      describe("limit filter - 5 by default", () => {
        const getLimitedComments = (limit) =>
          request(app)
            .get(
              `/api/articles/1/comments?${
                limit !== undefined ? "limit=" + limit : ""
              }`
            )
            .expect(200)
            .then((res) => res.body.comments);

        test("200:undefined, defaults to 5 items", () => {
          return getLimitedComments().then((comments) => {
            expect(comments).toHaveLength(5);
          });
        });

        test("200:3", () => {
          return getLimitedComments(3).then((comments) => {
            expect(comments).toHaveLength(3);
          });
        });

        test("200:0, defaults to 5 items", () => {
          return getLimitedComments(0).then((comments) => {
            expect(comments).toHaveLength(5);
          });
        });

        test("200:-1, defaults to 5 items", () => {
          return getLimitedComments(-1).then((comments) => {
            expect(comments).toHaveLength(5);
          });
        });

        test("200:0.8, defaults to 5 items", () => {
          return getLimitedComments(0.8).then((comments) => {
            expect(comments).toHaveLength(5);
          });
        });

        test("200:1000, serves 10 items max", () => {
          return getLimitedComments(1000).then((comments) => {
            expect(comments).toHaveLength(10);
          });
        });
      });

      describe("page filter", () => {
        const articleOneCommentIds = [5, 2, 18, 13, 7, 8, 6, 12, 3, 4, 9];
        const getLimitedComments = (limit, page) => {
          const queries = [
            "sort_by=article_id",
            "order=ASC",
            limit !== undefined && `limit=${limit}`,
            page !== undefined && `page=${page}`,
          ]
            .filter((q) => q)
            .join("&");

          return request(app)
            .get(`/api/articles/1/comments?${queries}`)
            .expect(200)
            .then((res) => res.body.comments);
        };

        test("200:undefined, has ids from index 0-4", () => {
          return getLimitedComments().then((comments) => {
            expect(comments).toHaveLength(5);

            comments.forEach(({ comment_id }, index) => {
              expect(comment_id).toBe(articleOneCommentIds[index]);
            });
          });
        });

        test("200:1, has ids from index 0-4", () => {
          return getLimitedComments(5, 1).then((comments) => {
            expect(comments).toHaveLength(5);

            comments.forEach(({ comment_id }, index) => {
              expect(comment_id).toBe(articleOneCommentIds[index]);
            });
          });
        });

        test("200:2, has ids from index 5-9", () => {
          return getLimitedComments(5, 2).then((comments) => {
            expect(comments).toHaveLength(5);

            comments.forEach(({ comment_id }, index) => {
              expect(comment_id).toBe(articleOneCommentIds[index + 5]);
            });
          });
        });

        test("200:3, has ids from index 10-11", () => {
          return getLimitedComments(5, 3).then((comments) => {
            expect(comments).toHaveLength(1);

            comments.forEach(({ comment_id }, index) => {
              expect(comment_id).toBe(articleOneCommentIds[index + 10]);
            });
          });
        });

        test("200:4, has empty array", () => {
          return getLimitedComments(5, 4).then((comments) => {
            expect(comments).toHaveLength(0);
          });
        });

        test("200:0, has ids from index 0-4", () => {
          return getLimitedComments(5, 1).then((comments) => {
            expect(comments).toHaveLength(5);

            comments.forEach(({ comment_id }, index) => {
              expect(comment_id).toBe(articleOneCommentIds[index]);
            });
          });
        });

        test("200:-1, has ids from index 0-4", () => {
          return getLimitedComments(5, -1).then((comments) => {
            expect(comments).toHaveLength(5);

            comments.forEach(({ comment_id }, index) => {
              expect(comment_id).toBe(articleOneCommentIds[index]);
            });
          });
        });

        test("200:0.8, has ids from index 0-4", () => {
          return getLimitedComments(5, 0.8).then((comments) => {
            expect(comments).toHaveLength(5);

            comments.forEach(({ comment_id }, index) => {
              expect(comment_id).toBe(articleOneCommentIds[index]);
            });
          });
        });

        test("200:hello, has ids from index 0-4", () => {
          return getLimitedComments(5, "hello").then((comments) => {
            expect(comments).toHaveLength(5);

            comments.forEach(({ comment_id }, index) => {
              expect(comment_id).toBe(articleOneCommentIds[index]);
            });
          });
        });
      });

      describe("pagination", () => {
        test("200:limit=1, total_pages=11", () => {
          return request(app)
            .get("/api/articles/1/comments?limit=1")
            .expect(200)
            .then((res) => {
              const {
                pagination: { total_pages },
              } = res.body;

              expect(total_pages).toBe(11);
            });
        });

        test("200:limit=3, total_pages=4", () => {
          return request(app)
            .get("/api/articles/1/comments?limit=3")
            .expect(200)
            .then((res) => {
              const {
                pagination: { total_pages },
              } = res.body;

              expect(total_pages).toBe(4);
            });
        });

        test("200:page=2, prev_page=1, next_page=3", () => {
          return request(app)
            .get("/api/articles/1/comments?page=2")
            .expect(200)
            .then((res) => {
              const {
                pagination: { prev_page, next_page },
              } = res.body;

              expect(prev_page).toBe(1);
              expect(next_page).toBe(3);
            });
        });

        test("200:page=3, prev_page=2, next_page=null", () => {
          return request(app)
            .get("/api/articles/1/comments?page=3")
            .expect(200)
            .then((res) => {
              const {
                pagination: { prev_page, next_page },
              } = res.body;

              expect(prev_page).toBe(2);
              expect(next_page).toBe(null);
            });
        });
      });
    });
  });

  describe("POST", () => {
    describe("Mutation", () => {
      beforeEach(seedTest);

      test("Responds with 201 and created comment", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send({
            username: "lurker",
            body: "Lorem ipsum dolor sit amet.",
          })
          .expect(201)
          .then((res) => {
            const { comment } = res.body;

            expect(comment).toEqual(expect.objectContaining(outputSchema));
          });
      });

      test("Ignores extra elements", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send({
            username: "lurker",
            body: "Lorem ipsum dolor sit amet.",
            votes: 100,
            hello: "world",
          })
          .expect(201)
          .then((res) => {
            const { comment } = res.body;

            expect(comment.votes).not.toBe(100);
            expect(comment.hello).toBeUndefined();
          });
      });
    });

    describe("Validation", () => {
      beforeAll(seedTest);

      test("Responds with 400 when body is missing or has invalid type", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send()
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid data");
          });
      });

      describe("element article_id", () => {
        test("Responds with 400 when received invalid id type", () => {
          return request(app)
            .post("/api/articles/hello/comments")
            .send({
              username: "lurker",
              body: "Lorem ipsum dolor sit amet.",
            })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Received invalid type");
            });
        });

        test("Responds with 400 when received non existing id", () => {
          return request(app)
            .post("/api/articles/999/comments")
            .send({
              username: "lurker",
              body: "Lorem ipsum dolor sit amet.",
            })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Received invalid reference value");
            });
        });
      });

      describe("element body", () => {
        test("Responds with 400 when body element is of wrong type", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "lurker", body: true })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Element 'body' has wrong type");
            });
        });

        test("Responds with 400 when body element is too short", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "lurker", body: "" })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Element 'body' is too short");
            });
        });
      });

      describe("element username", () => {
        test("Responds with 400 when username element is of wrong type", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({ body: "Lorem ipsum dolor sit amet." })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Element 'username' has wrong type");
            });
        });

        test("Responds with 400 when username element is invalid", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "hello", body: "Lorem ipsum dolor sit amet." })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Received invalid reference value");
            });
        });
      });
    });
  });
});
