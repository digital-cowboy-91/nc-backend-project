const destroyComment = require("../models/destroyComment.model");

function deleteComment(req, res, next) {
  const { comment_id } = req.params;

  return destroyComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => next(err));
}

module.exports = deleteComment;
