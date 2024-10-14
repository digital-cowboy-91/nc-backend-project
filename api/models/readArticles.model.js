const format = require("pg-format");
const db = require("../../db/connection.js");

function readArticles() {
  const columns = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
  ];

  const sql = format(
    `
    SELECT %s, COUNT(comments.comment_id)::INT AS comment_count
        FROM articles JOIN comments
            ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC
        `,
    columns.map((col) => "articles." + col)
  );

  return db.query(sql).then((data) => data.rows);
}

module.exports = readArticles;
