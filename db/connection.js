const { Pool } = require("pg");
const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE) {
  throw new Error("PGDATABASE not set");
}

const config = {};

if (ENV === "production") {
  config.connectionString = process.env.PGDATABASE;
  config.max = 10;
}

module.exports = new Pool(config);
