const fs = require("fs");
const makeArray = e => e.split("\n");

const first = makeArray(
  fs.readFileSync("./datasets/first_names.all.txt", "utf8")
);
const last = makeArray(
  fs.readFileSync("./datasets/last_names.all.txt", "utf8")
);

const names = {
  first,
  last
};

module.exports = names;
