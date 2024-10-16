const readArticleById = require("../models/readArticleById.model");
const readArticleComments = require("../models/readArticleComments.model");

function getArticleComments(req, res, next) {
  const { article_id } = req.params;

  const promises = [
    readArticleById(article_id),
    readArticleComments(article_id),
  ];

  return Promise.all(promises)
    .then(([_article, comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => next(err));
}

module.exports = getArticleComments;
