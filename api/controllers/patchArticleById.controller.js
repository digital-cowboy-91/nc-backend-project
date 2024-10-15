const readArticleById = require("../models/readArticleById.model");
const updateArticleVote = require("../models/updateArticleVote");

function patchArticleById(req, res, next) {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  return readArticleById(article_id)
    .then(() => {
      return updateArticleVote(article_id, inc_votes);
    })
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
}

module.exports = patchArticleById;
