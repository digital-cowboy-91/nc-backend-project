const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");
const endpointsData = require("../endpoints.json");
const req = require("express/lib/request.js");
const { customSort } = require("../db/seeds/utils.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api/healthCheck", () => {
  describe("GET", () => {
    test("Responds with 200 and alive message", () => {
      return request(app)
        .get("/api/healthCheck")
        .expect(200)
        .then((res) => {
          expect(res.body.msg).toBe("Alive!");
        });
    });
  });
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("Responds with 200 and array of topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then((res) => {
          const topics = res.body.topics;

          expect(topics.length).not.toBe(0);

          topics.forEach((topic) => {
            expect(topic).toEqual(
              expect.objectContaining({
                slug: expect.any(String),
                description: expect.any(String),
              })
            );
          });
        });
    });
  });
});

describe("/api", () => {
  describe("GET", () => {
    test("Responds with 200 and available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then((res) => {
          expect(res.body.endpoints).toEqual(endpointsData);
        });
    });
  });
});

describe("/api/articles/:article_id", () => {
  const base = "/api/articles/";

  describe("GET", () => {
    test("Responds with 200 and single article", () => {
      return request(app)
        .get(base + 1)
        .expect(200)
        .then((res) => {
          const article = res.body.article;

          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              body: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
        });
    });

    test("Responds with 400 and msg object when received invalid id type", () => {
      return request(app)
        .get(base + "hello_world")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Received invalid type");
        });
    });

    test("Responds with 404 and msg object when received non existing id", () => {
      return request(app)
        .get(base + 10000)
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Article does not exist");
        });
    });
  });

  describe("PATCH", () => {
    const getArticleById = (id) =>
      request(app)
        .get(base + id)
        .then((res) => res.body.article);

    test("Responds with 200 and updated article", () => {
      let originalArticle;

      const newVote = -10;

      return getArticleById(1)
        .then((article) => {
          article.votes += newVote;
          originalArticle = article;

          return request(app)
            .patch(base + 1)
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
            .patch(base + 1)
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
            .patch(base + 1)
            .send({ article_id: 0, title: "Hello" })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Element 'inc_votes' has invalid type");
            });
        });

        test("Responds with 400 when inc_votes is not whole number", () => {
          return request(app)
            .patch(base + 1)
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
            .patch(base + "hello")
            .send({ inc_votes: 10 })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Received invalid type");
            });
        });

        test("Responds with 404 when received non existing id", () => {
          return request(app)
            .patch(base + 999)
            .send({ inc_votes: 10 })
            .expect(404)
            .then((res) => {
              expect(res.body.msg).toBe("Article does not exist");
            });
        });
      });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  const base = (id) => `/api/articles/${id}/comments`;

  const commentSchema = {
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
        .get(base(1))
        .expect(200)
        .then((res) => {
          const { comments } = res.body;

          expect(comments.length).not.toBe(0);

          comments.forEach((comment) => {
            expect(comment).toEqual(expect.objectContaining(commentSchema));
          });
        });
    });

    test("Responds with 200 and an empty array if article has no comments", () => {
      return request(app)
        .get(base(2))
        .expect(200)
        .then((res) => {
          const { comments } = res.body;

          expect(comments.length).toBe(0);
        });
    });

    test("Comments are ordered by date in descending order", () => {
      return request(app)
        .get(base(1))
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
        .get(base("hello"))
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Received invalid type");
        });
    });

    test("Responds with 404 and msg object when received non existing id", () => {
      return request(app)
        .get(base(999))
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Article does not exist");
        });
    });
  });

  describe("POST", () => {
    test("Responds with 201 and created comment", () => {
      return request(app)
        .post(base(1))
        .send({
          username: "lurker",
          body: "Lorem ipsum dolor sit amet.",
        })
        .expect(201)
        .then((res) => {
          const { comment } = res.body;

          expect(comment).toEqual(expect.objectContaining(commentSchema));
        });
    });

    test("Ignores extra elements", () => {
      return request(app)
        .post(base(1))
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
          .post(base(1))
          .send()
          .expect(400)
          .then((res) => {
            expect(res.body.msg).toBe("Invalid data");
          });
      });

      describe("element article_id", () => {
        test("Responds with 400 when received invalid id type", () => {
          return request(app)
            .post(base("hello"))
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
            .post(base(999))
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
            .post(base(1))
            .send({ username: "lurker", body: true })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Element 'body' has wrong type");
            });
        });

        test("Responds with 400 when body element is too short", () => {
          return request(app)
            .post(base(1))
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
            .post(base(1))
            .send({ body: "Lorem ipsum dolor sit amet." })
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Element 'username' has wrong type");
            });
        });

        test("Responds with 400 when username element is invalid", () => {
          return request(app)
            .post(base(1))
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

describe("/api/articles", () => {
  const base = "/api/articles";

  describe("GET", () => {
    test("Responds with 200 and article list", () => {
      return request(app)
        .get(base)
        .expect(200)
        .then((res) => {
          const { articles } = res.body;

          expect(articles.length).not.toBe(0);

          articles.forEach((article) => {
            expect(article).toEqual(
              expect.objectContaining({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String),
                comment_count: expect.any(Number),
              })
            );
          });
        });
    });

    test("Article list is sorted by date in descending order by default", () => {
      return request(app)
        .get(base)
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

    describe("Queries", () => {
      describe("sort_by - created_at by default", () => {
        const getSortedArticles = (col) =>
          request(app)
            .get(`${base}?${col ? "sort_by=" + col : ""}`)
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
            .get(`${base}?sort_by=any}`)
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Invalid sort_by query");
            });
        });

        test("400:empty", () => {
          return request(app)
            .get(`${base}?sort_by=}`)
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
            .get(`${base}?${queries}`)
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
            .get(`${base}?order=any}`)
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Invalid order query");
            });
        });

        test("400:empty", () => {
          return request(app)
            .get(`${base}?order=}`)
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Invalid order query");
            });
        });
      });
      describe("topic filter", () => {
        const getArticlesByTopic = (topic) =>
          request(app)
            .get(`${base}?${topic ? "topic=" + topic : ""}`)
            .expect(200)
            .then((res) => res.body.articles);

        test("200:cats", () => {
          return getArticlesByTopic("cats").then((articles) => {
            expect(articles).toHaveLength(1);
          });
        });

        test("200:mitch", () => {
          return getArticlesByTopic("mitch").then((articles) => {
            expect(articles).toHaveLength(12);
          });
        });

        test("400:glitch", () => {
          return request(app)
            .get(`${base}?topic=glitch`)
            .expect(400)
            .then((res) => {
              expect(res.body.msg).toBe("Invalid topic query");
            });
        });
      });
    });
  });
});

describe("/api/comments/:comment_id", () => {
  const base = "/api/comments/";

  describe("DELETE", () => {
    test("Responds with 204 and no content", () => {
      return request(app)
        .delete(base + 1)
        .expect(204)
        .then((res) => {
          expect(res.body).toEqual({});
        });
    });
    test("Responds with 400 if invalid id type provided", () => {
      return request(app)
        .delete(base + "hello")
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Received invalid type");
        });
    });
    test("Responds with 404 if id does not exist", () => {
      return request(app)
        .delete(base + 999)
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Comment not found");
        });
    });
  });
});

describe("/api/users", () => {
  const base = "/api/users";
  describe("GET", () => {
    test("Responds with 200 and list of users", () => {
      return request(app)
        .get(base)
        .expect(200)
        .then((res) => {
          const { users } = res.body;

          expect(users.length).not.toBe(0);

          users.forEach((user) => {
            expect(user).toEqual(
              expect.objectContaining({
                username: expect.any(String),
                name: expect.any(String),
                avatar_url: expect.any(String),
              })
            );
          });
        });
    });
  });
});
