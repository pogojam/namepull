const fs = require("fs");
const makeArray = e => e.split("\n");
const path = require("path");

const first = makeArray(
  fs.readFileSync(path.join(__dirname, "./datasets/last_names.all.txt"), "utf8")
);
const last = makeArray(
  fs.readFileSync(path.join(__dirname, "./datasets/last_names.all.txt"), "utf8")
);

const names = {
  first,
  last
};

module.exports = names;
