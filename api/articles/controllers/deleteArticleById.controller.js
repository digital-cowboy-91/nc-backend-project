const destroyArticleById = require("../models/destroyArticleById.model");

function deleteArticleById(req, res, next) {
  const { article_id } = req.params;

  return destroyArticleById(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => next(err));
}

module.exports = deleteArticleById;
