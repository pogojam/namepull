const fs = require("fs");
const { promisify } = require("util");
const { convertArrayToCSV } = require("convert-array-to-csv");
const { asyncForEach, clean, findName, findPhone } = require("./util");
const readFile = promisify(fs.readFile);
3;
const Path = require("path");
const CommonLibrary = require("./common.json");
const Spinner = require("cli-spinner").Spinner;

// Extend Common Values
const extension = ["-", "Delivered", "(iMessage)", "PM", "AM", "ADD"];
const fileExtension = ".html";
const path = "./Archive/";
// Prod
// const path = Path.dirname(process.execPath) + "/";

CommonLibrary.commonWords = CommonLibrary.commonWords.concat(extension);

//
//

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

const buildRow = async (files, dataset) => {
  const output = [];

  await asyncForEach(files, async file => {
    // Spinner
    const spinner = new Spinner(file + " " + "processing..");
    spinner.setSpinnerString("|/-\\");
    spinner.start();

    // Build Logic
    const rawContent = await readFile(path + file, "utf8");
    const content = clean(rawContent);

    // const phoneNumber = file.replace(",", " ").split(" ")[0];
    const phoneNumber = findPhone(content);
    const firstLastName = findName(content, phoneNumber, dataset);

    output.push({
      Phone: phoneNumber,
      Name: firstLastName
    });
    spinner.stop();
  });

  return output;
};

const init = names => {
  // Read Files
  fs.readdir(path, async (err, files) => {
    files = files.reduce((acc, e, i) => {
      e.includes(fileExtension) ? acc.push(e) : null;
      return acc;
    }, []);
    // Start Build
    if (files.length > 0) {
      const data = await buildRow(files, names);
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
