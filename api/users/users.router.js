const express = require("express");
const router = express.Router();

const getUsers = require("./controllers/getUsers.controller");
const getUserByUsername = require("./controllers/getUserByUsername.controller");

router.route("/api/users").get(getUsers);

router.route("/api/users/:username").get(getUserByUsername);

module.exports = router;
