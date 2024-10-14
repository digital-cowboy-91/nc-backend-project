const readArticles = require("../models/readArticles.model");

function getArticles(req, res, next) {
  return readArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => next(err));
}

module.exports = getArticles;
