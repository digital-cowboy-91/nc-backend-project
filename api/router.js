const express = require("express");
const router = express.Router();

const getApi = require("./_controllers/getApi.controller");

router.route("/api").get(getApi);

module.exports = router;
