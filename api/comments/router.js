const express = require("express");
const router = express.Router();

const deleteComment = require("./controllers/deleteComment.controller");

router.route("/api/comments/:comment_id").delete(deleteComment);

module.exports = router;
