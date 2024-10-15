const format = require("pg-format");
const db = require("../../db/connection.js");

function createArticleComment(article_id, data) {
  const { username, body } = data;

  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return rejectWith(400, "Invalid data");
  }

  if (typeof body !== "string") {
    return rejectWith(400, "Element 'body' has wrong type");
  } else if (body.length < 3) {
    return rejectWith(400, "Element 'body' is too short");
  }

  if (typeof username !== "string") {
    return rejectWith(400, "Element 'username' has wrong type");
  }

  const sql = format(
    `
    INSERT INTO comments (article_id, author, body)
        VALUES (%L, %L, %L)
        RETURNING *
    `,
    article_id,
    username,
    body
  );

  return db.query(sql).then((data) => {
    return data.rows[0];
  });
}

function rejectWith(code, msg) {
  return Promise.reject({ code, msg });
}

module.exports = createArticleComment;
