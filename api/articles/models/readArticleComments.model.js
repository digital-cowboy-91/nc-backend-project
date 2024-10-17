const format = require("pg-format");
const db = require("../../../db/connection.js");

function readArticleComments(article_id) {
  const sql = format(
    `SELECT * FROM comments WHERE article_id = %L ORDER BY created_at DESC`,
    article_id
  );

  return db.query(sql).then((data) => data.rows);
}

module.exports = readArticleComments;
