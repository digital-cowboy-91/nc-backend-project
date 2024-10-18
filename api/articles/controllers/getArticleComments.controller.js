const readArticleById = require("../models/readArticleById.model");
const readArticleComments = require("../models/readArticleComments.model");

function getArticleComments(req, res, next) {
  const {
    params: { article_id },
    query,
  } = req;

  const promises = [
    readArticleById(article_id),
    readArticleComments(article_id, query),
  ];

  return Promise.all(promises)
    .then(([_article, payload]) => {
      res.status(200).send(payload);
    })
    .catch((err) => next(err));
}

module.exports = getArticleComments;
