const alphaNumeric =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_:.";

function checkingAZNumberMinus(input) {
  var approved = "";

  if (input != undefined && input != null) {
    for (var i in input) {
      if (alphaNumeric.includes(input[i])) {
        approved += input[i];
      }
    }
  }
  return approved;
}

module.exports = {
  checkingAZNumberMinus,
};
