const format = require("pg-format");
const db = require("../../db/connection.js");

function readArticles(query) {
  const allowed = {
    columns: [
      "author",
      "title",
      "article_id",
      "topic",
      "created_at",
      "votes",
      "article_img_url",
    ],
    sortBy: ["author", "title", "article_id", "topic", "created_at", "votes"],
    order: ["ASC", "DESC"],
  };

  const sortBy = query.sort_by ?? "created_at";
  const order = query.order ?? "DESC";

  if (!allowed.sortBy.includes(sortBy)) {
    return rejectWith(400, "Invalid sort_by query");
  }

  if (!allowed.order.includes(order)) {
    return rejectWith(400, "Invalid order query");
  }

  const SELECT = format(
    `
    SELECT %s, COUNT(comments.comment_id)::INT AS comment_count
        FROM articles JOIN comments
            ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        `,
    allowed.columns.map((col) => "articles." + col)
  );

  const ORDER_BY = format(`ORDER BY articles.%s %s`, sortBy, order);

  const sql = [SELECT, ORDER_BY].join(" ");

  // console.log(sql);

  return db.query(sql).then((data) => data.rows);
}

function rejectWith(code, msg) {
  return Promise.reject({ code, msg });
}

module.exports = readArticles;
