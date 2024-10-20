const createArticleComment = require("../models/createArticleComments.model");
const readArticleById = require("../models/readArticleById.model");

function postArticleComments(req, res, next) {
  const {
    params: { article_id },
    body,
  } = req;

  return readArticleById(article_id)
    .then(() => {
      return createArticleComment(article_id, body);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => next(err));
}

module.exports = postArticleComments;
