const format = require("pg-format");
const db = require("../../../db/connection.js");

function createArticle(payload) {
  const allowed = {
    cols: [
      ["author", "string"],
      ["title", "string"],
      ["body", "string"],
      ["topic", "string"],
      [
        "article_img_url",
        "string",
        "https://default.co.uk/some/random/img.jpg",
      ],
    ],
  };

  const VALUES = [];

  for (const [key, type, defaultVal] of allowed.cols) {
    const val = payload[key];

    if (typeof val !== type) {
      if (!defaultVal) {
        return Promise.reject({ code: 400, msg: `Invalid type of ${key}` });
      }

      VALUES.push(defaultVal);
    } else {
      VALUES.push(val);
    }
  }

  const sql = format(
    `
        INSERT INTO articles (%s)
            VALUES (%L)
            RETURNING *
    `,
    allowed.cols.map(([key]) => key),
    VALUES
  );

  return db.query(sql).then((data) => {
    const article = data.rows[0];
    article.comment_count = 0;

    return article;
  });
}

module.exports = createArticle;
