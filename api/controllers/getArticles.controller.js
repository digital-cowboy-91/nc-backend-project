const readArticles = require("../models/readArticles.model");

function getArticles(req, res, next) {
  const { query } = req;

  return readArticles(query)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => next(err));
}

module.exports = getArticles;
