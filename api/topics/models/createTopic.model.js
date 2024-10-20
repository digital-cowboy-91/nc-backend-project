const format = require("pg-format");
const db = require("../../../db/connection.js");

function createTopic(body) {
  const { slug, description } = body;

  if (!slug) {
    return rejectWith(400, "Invalid type of slug");
  } else if (!/^[a-z-]{3,20}$/.test(slug)) {
    return rejectWith(400, "Invalid format of slug");
  }

  if (typeof description !== "string") {
    return rejectWith(400, "Invalid type of description");
  }

  const sql = format(
    `
    INSERT INTO topics
      VALUES (%L, %L)
      RETURNING *
    `,
    slug,
    description
  );

  return db.query(sql).then((data) => data.rows[0]);
}

function rejectWith(code, msg) {
  return Promise.reject({ code, msg });
}

module.exports = createTopic;
