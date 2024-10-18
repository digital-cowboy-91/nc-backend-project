const request = require("supertest");
const app = require("../../../app.js");

const db = require("../../../db/connection.js");
const seed = require("../../../db/seeds/seed.js");
const testData = require("../../../db/data/test-data/index.js");
const { customSort } = require("../../../db/seeds/utils.js");
const { getPagination } = require("../../api-utils.js");

beforeEach(() => seed(testData));
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
    test("200: has article list", () => {
      const schema = useOutputSchema();
      delete schema.body;

      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((res) => {
          const { articles } = res.body;
          expect(articles.length).toBe(5);

          articles.forEach((article) => {
            expect(article).toEqual(expect.objectContaining(schema));
          });
        });
    });

    test("Article list is sorted by date in descending order by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((res) => {
          const { articles } = res.body;

          articles.reduce((prevDate, { created_at }) => {
            const thisDate = new Date(created_at).getTime();

            expect(prevDate >= thisDate).toBe(true);

            return thisDate;
          }, Infinity);
        });
    });

    test("200: has pagination", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((res) => {
          const { pagination } = res.body;

          expect(pagination).toEqual(getPagination(13, 5, 0));
        });
    });

    describe("Queries", () => {
      describe("sort_by - created_at by default", () => {
        const getSortedArticles = (col) =>
          request(app)
            .get(`/api/articles?${col ? "sort_by=" + col : ""}`)
            .expect(200)
            .then((res) => res.body.articles);

        test("200:created_at (default)", () => {
          return getSortedArticles().then((articles) => {
            expect(customSort(articles, "created_at", "DESC")).toBe(true);
          });
        });

        test("200:article_id", () => {
          return getSortedArticles("article_id").then((articles) => {
            expect(customSort(articles, "article_id", "DESC")).toBe(true);
          });
        });

        test("200:title", () => {
          return getSortedArticles("title").then((articles) => {
            expect(customSort(articles, "title", "DESC")).toBe(true);
          });
        });

        test("200:topic", () => {
          return getSortedArticles("topic").then((articles) => {
            expect(customSort(articles, "topic", "DESC")).toBe(true);
          });
        });

        test("200:author", () => {
          return getSortedArticles("author").then((articles) => {
            expect(customSort(articles, "author", "DESC")).toBe(true);
          });
        });

        test("200:votes", () => {
          return getSortedArticles("votes").then((articles) => {
            expect(customSort(articles, "votes", "DESC")).toBe(true);
          });
        });

        test("400:any", () => {
          return request(app)
            .get(`/api/articles?sort_by=any}`)
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Invalid sort_by query");
            });
        });

        test("400:empty", () => {
          return request(app)
            .get(`/api/articles?sort_by=}`)
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Invalid sort_by query");
            });
        });
      });
      describe("order - descending by default", () => {
        const getOrderedArticles = (col, order) => {
          const queries = [col && "sort_by=" + col, order && "order=" + order]
            .filter((q) => q)
            .join("&");

          return request(app)
            .get(`/api/articles?${queries}`)
            .expect(200)
            .then((res) => res.body.articles);
        };

        test("200:created_at, DESC (default)", () => {
          return getOrderedArticles().then((articles) => {
            expect(customSort(articles, "created_at", "DESC")).toBe(true);
          });
        });

        test("200:created_at, ASC", () => {
          return getOrderedArticles(undefined, "ASC").then((articles) => {
            expect(customSort(articles, "created_at", "ASC")).toBe(true);
          });
        });

        test("200:article_id, DESC", () => {
          return getOrderedArticles("article_id").then((articles) => {
            expect(customSort(articles, "article_id", "DESC")).toBe(true);
          });
        });

        test("200:article_id, ASC", () => {
          return getOrderedArticles("article_id", "ASC").then((articles) => {
            expect(customSort(articles, "article_id", "ASC")).toBe(true);
          });
        });

        test("200:title, DESC", () => {
          return getOrderedArticles("title").then((articles) => {
            expect(customSort(articles, "title", "DESC")).toBe(true);
          });
        });

        test("200:title, ASC", () => {
          return getOrderedArticles("title", "ASC").then((articles) => {
            expect(customSort(articles, "title", "ASC")).toBe(true);
          });
        });

        test("400:any", () => {
          return request(app)
            .get(`/api/articles?order=any}`)
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Invalid order query");
            });
        });

        test("400:empty", () => {
          return request(app)
            .get(`/api/articles?order=}`)
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Invalid order query");
            });
        });
      });
      describe("topic filter", () => {
        const getArticlesByTopic = (topic) =>
          request(app)
            .get(`/api/articles?${topic ? "topic=" + topic : ""}`)
            .expect(200)
            .then((res) => res.body.articles);

        test("200:cats", () => {
          return getArticlesByTopic("cats").then((articles) => {
            expect(articles).toHaveLength(1);
          });
        });

        test("200:mitch", () => {
          return getArticlesByTopic("mitch").then((articles) => {
            expect(articles).toHaveLength(5);
          });
        });

        test("400:glitch", () => {
          return request(app)
            .get(`/api/articles?topic=glitch`)
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Invalid topic query");
            });
        });
      });
      describe("limit filter - 5 by default", () => {
        const getLimitedArticles = (limit) =>
          request(app)
            .get(`/api/articles?${limit !== undefined ? "limit=" + limit : ""}`)
            .expect(200)
            .then((res) => res.body.articles);

        test("200:undefined, defaults to 5 items", () => {
          return getLimitedArticles().then((articles) => {
            expect(articles).toHaveLength(5);
          });
        });

        test("200:3", () => {
          return getLimitedArticles(3).then((articles) => {
            expect(articles).toHaveLength(3);
          });
        });

        test("200:0, defaults to 5 items", () => {
          return getLimitedArticles(0).then((articles) => {
            expect(articles).toHaveLength(5);
          });
        });

        test("200:-1, defaults to 5 items", () => {
          return getLimitedArticles(-1).then((articles) => {
            expect(articles).toHaveLength(5);
          });
        });

        test("200:0.8, defaults to 5 items", () => {
          return getLimitedArticles(0.8).then((articles) => {
            expect(articles).toHaveLength(5);
          });
        });

        test("200:1000, serves 10 items max", () => {
          return getLimitedArticles(1000).then((articles) => {
            expect(articles).toHaveLength(10);
          });
        });
      });
      describe("page filter", () => {
        const getLimitedArticles = (limit, page) => {
          const queries = [
            "sort_by=article_id",
            "order=ASC",
            limit !== undefined && `limit=${limit}`,
            page !== undefined && `page=${page}`,
          ]
            .filter((q) => q)
            .join("&");

          return request(app)
            .get(`/api/articles?${queries}`)
            .expect(200)
            .then((res) => res.body.articles);
        };

        test("200:undefined, has ids from 1-5", () => {
          return getLimitedArticles().then((articles) => {
            expect(articles).toHaveLength(5);

            articles.forEach(({ article_id }, index) => {
              expect(article_id).toBe(index + 1);
            });
          });
        });

        test("200:1, has ids from 1-5", () => {
          return getLimitedArticles(5, 1).then((articles) => {
            expect(articles).toHaveLength(5);

            articles.forEach(({ article_id }, index) => {
              expect(article_id).toBe(index + 1);
            });
          });
        });

        test("200:2, has ids from 6-10", () => {
          return getLimitedArticles(5, 2).then((articles) => {
            expect(articles).toHaveLength(5);

            articles.forEach(({ article_id }, index) => {
              expect(article_id).toBe(index + 6);
            });
          });
        });

        test("200:3, has ids from 11-13", () => {
          return getLimitedArticles(5, 3).then((articles) => {
            expect(articles).toHaveLength(3);

            articles.forEach(({ article_id }, index) => {
              expect(article_id).toBe(index + 11);
            });
          });
        });

        test("200:4, has empty array", () => {
          return getLimitedArticles(5, 4).then((articles) => {
            expect(articles).toHaveLength(0);
          });
        });

        test("200:0, has ids from 1-5", () => {
          return getLimitedArticles(5, 1).then((articles) => {
            expect(articles).toHaveLength(5);

            articles.forEach(({ article_id }, index) => {
              expect(article_id).toBe(index + 1);
            });
          });
        });

        test("200:-1, has ids from 1-5", () => {
          return getLimitedArticles(5, -1).then((articles) => {
            expect(articles).toHaveLength(5);

            articles.forEach(({ article_id }, index) => {
              expect(article_id).toBe(index + 1);
            });
          });
        });

        test("200:0.8, has ids from 1-5", () => {
          return getLimitedArticles(5, 0.8).then((articles) => {
            expect(articles).toHaveLength(5);

            articles.forEach(({ article_id }, index) => {
              expect(article_id).toBe(index + 1);
            });
          });
        });

        test("200:hello, has ids from 1-5", () => {
          return getLimitedArticles(5, "hello").then((articles) => {
            expect(articles).toHaveLength(5);

            articles.forEach(({ article_id }, index) => {
              expect(article_id).toBe(index + 1);
            });
          });
        });
      });
      describe("pagination", () => {
        test("200:limit=1, total_pages=13", () => {
          return request(app)
            .get("/api/articles?limit=1")
            .expect(200)
            .then((res) => {
              const {
                pagination: { total_pages },
              } = res.body;

              expect(total_pages).toBe(13);
            });
        });

        test("200:limit=3, total_pages=5", () => {
          return request(app)
            .get("/api/articles?limit=3")
            .expect(200)
            .then((res) => {
              const {
                pagination: { total_pages },
              } = res.body;

              expect(total_pages).toBe(5);
            });
        });

        test("200:page=2, prev_page=1, next_page=3", () => {
          return request(app)
            .get("/api/articles?page=2")
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
            .get("/api/articles?page=3")
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
    const usePayload = () => ({
      author: "lurker",
      title: "Hello World",
      body: "Lorem ipsum dolor sit amet.",
      topic: "mitch",
      article_img_url: "https://hello-world.co.uk/some/random/img.jpg",
    });

    test("201: has newly created article", () => {
      const payload = usePayload();

      return request(app)
        .post("/api/articles")
        .send(payload)
        .expect(201)
        .then((res) => {
          const { article } = res.body;

          expect(article).toEqual(useOutputSchema());
          expect(article).toMatchObject(payload);
        });
    });

    test("201: ignores unallowed properties", () => {
      const payload = usePayload();
      payload.article_id = 1;
      payload.hello = "World";

      return request(app)
        .post("/api/articles")
        .send(payload)
        .expect(201)
        .then((res) => {
          const { article } = res.body;

          expect(article.article_id).not.toBe(payload.article_id);
          expect(article.hello).toBe(undefined);
        });
    });

    describe("Validation", () => {
      test("400: author has wrong type", () => {
        const payload = usePayload();
        payload.author = 1;

        return request(app)
          .post("/api/articles")
          .send(payload)
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid type of author");
          });
      });

      test("400: author has wrong reference", () => {
        const payload = usePayload();
        payload.author = "hello";

        return request(app)
          .post("/api/articles")
          .send(payload)
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Received invalid reference value");
          });
      });

      test("400: title has wrong type", () => {
        const payload = usePayload();
        payload.title = 1;

        return request(app)
          .post("/api/articles")
          .send(payload)
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid type of title");
          });
      });

      test("400: body has wrong type", () => {
        const payload = usePayload();
        payload.body = 1;

        return request(app)
          .post("/api/articles")
          .send(payload)
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid type of body");
          });
      });

      test("400: topic has wrong type", () => {
        const payload = usePayload();
        payload.topic = 1;

        return request(app)
          .post("/api/articles")
          .send(payload)
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid type of topic");
          });
      });

      test("400: topic has wrong reference", () => {
        const payload = usePayload();
        payload.topic = "hello";

        return request(app)
          .post("/api/articles")
          .send(payload)
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Received invalid reference value");
          });
      });

      test("201: article_img_url defaults if not provided", () => {
        const payload = usePayload();
        delete payload.article_img_url;

        return request(app)
          .post("/api/articles")
          .send(payload)
          .expect(201)
          .then((res) => {
            const { article } = res.body;

            expect(article.article_img_url).toBe(
              "https://default.co.uk/some/random/img.jpg"
            );
          });
      });

      test("201: article_img_url defaults if wrong type", () => {
        const payload = usePayload();
        payload.article_img_url = 1;

        return request(app)
          .post("/api/articles")
          .send(payload)
          .expect(201)
          .then((res) => {
            const { article } = res.body;

            expect(article.article_img_url).toBe(
              "https://default.co.uk/some/random/img.jpg"
            );
          });
      });
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
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

    describe("Validation", () => {
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

  describe.only("DELETE", () => {
    test("204: has no content", () => {
      return request(app)
        .delete("/api/articles/1")
        .expect(204)
        .then((res) => {
          expect(res.body).toEqual({});
        });
    });

    describe("Validation", () => {
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

    describe("Validation", () => {
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
