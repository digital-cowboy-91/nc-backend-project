const createArticleComment = require("../models/createArticleComments.model");

function postArticleComments(req, res, next) {
  const {
    params: { article_id },
    body,
  } = req;

  return createArticleComment(article_id, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => next(err));
}

module.exports = postArticleComments;
