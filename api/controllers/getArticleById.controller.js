const readArticleById = require("../models/readArticleById.model");

function getArticleById(req, res, next) {
  const { article_id } = req.params;

  return readArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
}

module.exports = getArticleById;
