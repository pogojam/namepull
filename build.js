const fs = require("fs");
const { promisify } = require("util");
const { convertArrayToCSV } = require("convert-array-to-csv");
const { asyncForEach, clean } = require("./util");
const readFile = promisify(fs.readFile);
const Path = require("path");
const CommonLibrary = require("./common.json");
const Spinner = require("cli-spinner").Spinner;

// Extend Common Values
const extension = ["-", "Delivered", "(iMessage)", "PM", "AM", "ADD"];

CommonLibrary.commonWords = CommonLibrary.commonWords.concat(extension);

//
//

// const path = "./";

// Prod
const path = Path.dirname(process.execPath) + "/";

const namePull = (arr, i, pos) => {
  let name = "";

  const cycle = (arr, i, pos) => {
    let prev = arr[i - pos];
    if (pos > 2) return;
    if (CommonLibrary.commonWords.includes(prev)) return;

    if (prev.includes("\r\n")) {
      prev = prev.split("\r\n")[1];
    }
    name = prev.concat(" " + name);
    cycle(arr, i, pos + 1);
  };
  cycle(arr, i, pos);
  return name;
};

const buildRow = async files => {
  const output = [];

  await asyncForEach(files, async file => {
    const spinner = new Spinner(file + " " + "processing..");
    spinner.setSpinnerString("|/-\\");
    spinner.start();

    const number = file.replace(",", " ").split(" ")[0];
    console.info("Pulled" + number);
    const rawContent = await readFile(path + file, "utf16le");
    const content = clean(rawContent);

    const firstLastName = content.reduce((acc, val, i, arr) => {
      if (val.includes("+")) {
        const name = namePull(arr, i, 1);

        name.length > 0 ? ((acc = name), console.info("Found " + name)) : null;
        return acc;
      }
      return acc;
    }, null);

    output.push({
      Phone: number,
      Name: firstLastName
    });
    console.info("Finished with" + file);
    spinner.stop();
  });

  return output;
};

const init = () => {
  fs.readdir(path, async (err, files) => {
    files = files.reduce((acc, e, i) => {
      e.includes(".txt") ? acc.push(e) : null;
      return acc;
    }, []);

    if (files.length > 0) {
      const data = await buildRow(files);

      const csv = convertArrayToCSV(data);
      fs.writeFile(
        path + "output.csv",
        csv,
        (err, out) => err && console.error(err)
      );
      return;
    } else {
      console.warn("No .txt files inside this directory!");
    }
  });
};

module.exports = init;
