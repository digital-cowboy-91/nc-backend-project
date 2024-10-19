const express = require("express");
const router = express.Router();

const getTopics = require("./controllers/getTopics.controller");
const postTopic = require("./controllers/postTopic.controller");

router.route("/api/topics").get(getTopics).post(postTopic);

module.exports = router;
