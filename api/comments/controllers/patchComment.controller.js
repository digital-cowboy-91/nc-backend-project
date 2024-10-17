const updateComment = require("../models/updateComment.model");

function patchComment(req, res, next) {
  const {
    params: { comment_id },
    body,
  } = req;

  return updateComment(comment_id, body)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => next(err));
}

module.exports = patchComment;
