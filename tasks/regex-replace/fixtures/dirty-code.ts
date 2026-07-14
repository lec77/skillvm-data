// TODO: remove this debug logging
const DEBUG = true;

function processData(data: any) {
  console.log("DEBUG: entering processData", data);
  var result = [];  // should be let or const
  var count = 0;    // should be let or const
  for (var i = 0; i < data.length; i++) {  // should be let
    console.log("DEBUG: processing item", i);
    if (data[i].status == "active") {  // should be ===
      result.push(data[i]);
      count = count + 1;
    } else if (data[i].status == "pending") {  // should be ===
      console.log("DEBUG: skipping pending item");
      // do nothing
    }
  }
  console.log("DEBUG: result count", count);
  return result;
}

function validateEmail(email: string) {
  console.log("DEBUG: validating", email);
  var valid = email.indexOf("@") != -1;  // should use !== and let
  return valid;
}

function formatName(first: string, last: string) {
  var fullName = first + "  " + last;  // double space should be single
  console.log("DEBUG: formatted name", fullName);
  return fullName;
}
