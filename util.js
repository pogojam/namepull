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

const nameCase = e => e.charAt(0).toUpperCase() + e.slice(1);
const lowercase = e => e.map(e => e.toLowerCase());

function clean(raw) {
  const content = pipe(raw)(
    stripHTML,
    removeCarriage,
    removeSpacing,
    removeBraces,
    removeSymbol,
    splitFilterText,
    lowercase
  );
  return content;
}

const excludeList = [
  "tao",
  "kaos",
  "palms",
  "min",
  "will",
  "may",
  "cosmo",
  "marquee",
  "happy",
  "palms",
  "u"
];
const testNext = ["it"];

const isnum = input => /^\d+$/.test(input);
const isplus = input => /^\+/.test(input);
const noPlus = input => input.map(e => e.replace(/[+]/g, ""));

const validateFirst = (val, i, arr) => {
  if (/\d/.test(arr[i + 1])) return null;
  if (testNext.includes(arr[i + 1])) return null;
  if (excludeList.includes(val)) return null;
  return val;
};

function findName(content, sendersPhone, nameDataset, isThread) {
  let first;
  let last;
  let open = false;

  // Senders thread
  if (isThread) {
    content.reduce((acc, val, i, arr) => {
      if (/^\+/.test(val) && val === sendersPhone) open = true;
      if (/^\+/.test(val) && val !== sendersPhone) open = false;
      if (excludeList.includes(val)) return;

      if (val === "time" && nameDataset.first.includes(arr[i + 1])) {
        if (arr[i + 1] === "will") return;
        first = arr[i + 1];
        last = arr[i + 2];
      }

      // Name controlled using on/off
      if (open) {
        if (!first) {
          val = val.toLowerCase();
          nameDataset.first.includes(val)
            ? (first = validateFirst(val, i, arr))
            : null;
        }
        if (first && !last) {
          val = val.toLowerCase();
          if (val === first) return;
          nameDataset.last.includes(val) ? (last = val) : null;
        }
      }
    }, null);
  } else {
    noPlus(content).forEach((val, i, arr) => {
      if (isnum(val)) return;
      if (!first) {
        first = val;
        last = arr[i + 1];
      }
    });
  }

  first = first ? nameCase(first) : "";
  last = last ? nameCase(last) : "";
  return { first, last };
}

function findPhone(content, isThread) {
  // Collection Gate
  let open = true;
  let phone;

  // Handle Number for chat conversations
  if (isThread) {
    phone = content.reduce((acc, val, i, arr) => {
      // open and close gates to filter senders number
      if (val === "tel" && !open && arr[i - 1] !== "me") open = true;
      if (val === "me" && arr[i + 1] === "tel") {
        open = false;
      }

      if (isplus(val) && open) {
        acc = val;
        open = false;
        return acc;
      }
      return acc;
    }, null);
  } else {
    phone = noPlus(content).reduce((acc, val, i, arr) => {
      if (val.length === 1) return acc;
      if (isnum(val) && acc.length <= 13) {
        return val + acc;
      }
      return acc;
    }, "");
  }

  return phone;
}

module.exports = { asyncForEach, clean, findName, findPhone };
