const fs = require("fs");
const tokenize = require("html-tokenize");
const { asyncForEach } = require("./util");

function clean(rawTxt) {
  const tokens = tokenize(rawTxt);

  console.log("Make Token", tokens);

  return rawTxts;
}

module.exports = clean;
