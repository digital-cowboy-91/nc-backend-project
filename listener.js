const app = require("./app.js");

const { port = 8080 } = process.env;

app.listen(port, (err) => {
  if (err) {
    console.error("Something went wrong");
  } else {
    console.log(`Listening at ${port}!`);
  }
});
