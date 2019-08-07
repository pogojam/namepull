const strip = require("html-to-text");
const extractor = require("phone-number-extractor");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const pipe = input => (...arg) => arg.reduce((acc, val) => val(acc), input);
const removeSpacing = e => e.replace(/\n/g, " ");
const removeCarriage = e => e.replace(/\r/g, " ");
const removeBraces = e => e.replace(/[\[\]']+/g, " ");
const removeSymbol = e => e.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");
const stripHTML = e => strip.fromString(e);
const splitFilterText = e => e.split(" ").filter(e => e !== "");

function clean(raw) {
  //   console.log(raw);

  const content = pipe(raw)(
    stripHTML,
    removeCarriage,
    removeSpacing,
    removeBraces,
    removeSymbol,
    splitFilterText
  );

  console.log(content);
  return content;
}

function findName(content, sendersPhone, nameDataset) {
  content.reduce((acc, val, i, arr) => {
    // console.log("phone", sendersPhone);
  }, null);
}

function findPhone(content) {
  let open = true;
  const phone = content.reduce((acc, val) => {
    if (val === "Me") open = false;
    if (/^\+/.test(val) && open) {
      acc = val;
      return acc;
    }
    return acc;
  }, null);
  console.log(phone);
  return phone;
}

// content.reduce((acc, val, i, arr) => {
//   if (val.includes("+")) {
//     const name = namePull(arr, i, 1);

//     name.length > 0 ? (acc = name) : null;
//     return acc;
//   }
//   return acc;
// }, null);

module.exports = { asyncForEach, clean, findName, findPhone };
