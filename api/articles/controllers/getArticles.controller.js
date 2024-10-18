const readArticles = require("../models/readArticles.model");

function getArticles(req, res, next) {
  const { query } = req;

  return readArticles(query)
    .then((payload) => {
      res.status(200).send(payload);
    })
    .catch((err) => next(err));
}

module.exports = getArticles;
