const format = require("pg-format");
const db = require("../../../db/connection.js");
const { getLimit, getOffset, getPagination } = require("../../api.utils.js");

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
  const topic = query.topic;
  const limit = getLimit(query.limit);
  const offset = getOffset(limit, query.page);

  if (!allowed.sortBy.includes(sortBy)) {
    return rejectWith(400, "Invalid sort_by query");
  }

  if (!allowed.order.includes(order)) {
    return rejectWith(400, "Invalid order query");
  }

  const SELECT = format(
    `
    SELECT %s, COUNT(comments.comment_id)::INT AS comment_count
        FROM articles FULL JOIN comments
            ON articles.article_id = comments.article_id
        `,
    allowed.columns.map((col) => "articles." + col)
  );

  const WHERE = topic && format(`WHERE topic=%L`, topic);

  const GROUP_BY = `GROUP BY articles.article_id`;

  const ORDER_BY = format(`ORDER BY articles.%s %s`, sortBy, order);

  const LIMIT = format(`LIMIT %s OFFSET %s`, limit, offset);

  const sqlMain = [SELECT, WHERE, GROUP_BY, ORDER_BY, LIMIT]
    .filter((s) => s)
    .join(" ");

  const sqlCount = `SELECT COUNT(*)::INT FROM articles`;

  const promises = [db.query(sqlCount), db.query(sqlMain)];

  return Promise.all(promises).then(([count, main]) => {
    const pagination = getPagination(count.rows[0].count, limit, offset);

    if (topic && !main.rowCount) {
      return rejectWith(400, "Invalid topic query");
    }

    return {
      pagination,
      articles: main.rows,
    };
  });
}

function rejectWith(code, msg) {
  return Promise.reject({ code, msg });
}

module.exports = readArticles;
