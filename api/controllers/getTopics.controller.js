const readTopics = require("../models/readTopics.model.js");

function getTopics(_req, res, next) {
  return readTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => next(err));
}

module.exports = getTopics;
