const express = require("express");
const router = express.Router();

const deleteComment = require("./controllers/deleteComment.controller");
const patchComment = require("./controllers/patchComment.controller");

router
  .route("/api/comments/:comment_id")
  .delete(deleteComment)
  .patch(patchComment);

module.exports = router;
