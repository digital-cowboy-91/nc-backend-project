const format = require("pg-format");
const db = require("../../db/connection.js");

function readArticleById(id) {
  const sql = format(
    `
    SELECT articles.*, COUNT(comments.comment_id)::INT AS comment_count
      FROM articles LEFT JOIN comments
        ON articles.article_id = comments.article_id
      WHERE articles.article_id=%L
      GROUP BY articles.article_id`,
    id
  );

  return db.query(sql).then((data) => {
    if (data.rowCount === 0) {
      return Promise.reject({ code: 404, msg: "Article does not exist" });
    }

    return data.rows[0];
  });
}

module.exports = readArticleById;
