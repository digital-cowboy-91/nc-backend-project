const createArticle = require("../models/createArticle.model");

function postArticle(req, res, next) {
  const { body } = req;

  return createArticle(body)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => next(err));
}

module.exports = postArticle;
