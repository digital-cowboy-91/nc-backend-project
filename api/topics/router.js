const express = require("express");
const router = express.Router();

const getTopics = require("./controllers/getTopics.controller");

router.route("/api/topics").get(getTopics);

module.exports = router;
