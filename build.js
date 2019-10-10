const fs = require("fs");
const { promisify } = require("util");
const { convertArrayToCSV } = require("convert-array-to-csv");
const { asyncForEach, clean, findName, findPhone } = require("./util");
const readFile = promisify(fs.readFile);
const Path = require("path");
const Spinner = require("cli-spinner").Spinner;

//Dev
// const path = "./Archive/";
// Prod
const path = Path.dirname(process.execPath) + "/";

const buildRow = async (files, dataset, isThread) => {
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
    const phoneNumber = findPhone(content, isThread);
    const { first, last } = findName(content, phoneNumber, dataset);
    output.push({
      Phone: phoneNumber,
      Name: first + " " + last
    });
    console.log(output);
    spinner.stop();
  });

  return output;
};

const init = (names, fileExtension, isThread) => {
  // Read Files
  fs.readdir(path, async (err, files) => {
    files = files.reduce((acc, e, i) => {
      e.includes(fileExtension) ? acc.push(e) : null;
      return acc;
    }, []);
    // Start Build
    if (files.length > 0) {
      const data = await buildRow(files, names, isThread);
      const csv = convertArrayToCSV(data);
      fs.writeFile(
        path + "output.csv",
        csv,
        (err, out) => err && console.error(err)
      );
      return;
    } else {
      console.warn(`No ${fileExtension} files inside this directory!`);
    }
  });
};

module.exports = init;
