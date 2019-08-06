async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function clean(raw) {
  //   console.log(raw);
  const removeSpacing = e => e.replace(/\n/g, " ");
  const removeCarriage = e => e.replace(/\r/g, " ");

  const content = removeCarriage(removeSpacing(raw))
    .split(" ")
    .filter(e => e !== "");

  //   console.log(content);

  return content;
}

module.exports = { asyncForEach, clean };
