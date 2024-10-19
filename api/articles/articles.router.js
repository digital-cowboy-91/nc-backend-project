const express = require("express");
const router = express.Router();

const postArticleComments = require("./controllers/postArticleComments.controller");
const patchArticleById = require("./controllers/patchArticleById.controller");
const getArticles = require("./controllers/getArticles.controller");
const getArticleComments = require("./controllers/getArticleComments.controller");
const getArticleById = require("./controllers/getArticleById.controller");
const postArticle = require("./controllers/postArticle.controller");
const deleteArticleById = require("./controllers/deleteArticleById.controller");

router.route("/api/articles").get(getArticles).post(postArticle);

router
  .route("/api/articles/:article_id")
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(deleteArticleById);

router
  .route("/api/articles/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComments);

module.exports = router;
