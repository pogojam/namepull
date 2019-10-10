const names = require("./names");
const init = require("./build");
const inquirer = require("inquirer");
inquirer
  .prompt([
    {
      type: "list",
      name: "extension",
      message: "Select file extension",
      choices: [".htm", ".txt"]
    },
    {
      type: "list",
      name: "isThread",
      message: "Is this a message thread",
      choices: ["true", "false"]
    }
  ])
  .then(({ extension, isThread }) => {
    isThread = isThread.includes("true");

    init(names, extension, isThread);
  });
