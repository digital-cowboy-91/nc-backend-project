const express = require("express");
const router = express.Router();

const getUsers = require("./controllers/getUsers.controller");

router.route("/api/users").get(getUsers);

module.exports = router;
