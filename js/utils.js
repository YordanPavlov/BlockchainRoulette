function validateHash(inputHash) {
  if(66 == inputHash.length) {
    if('0' == inputHash[0] && 'x' == inputHash[1]) {
      // looks OK, no changes needed
      return inputHash;
    } else {
      alert("Hash should start with 0x");
      return false;
    }
  } else if (64 == inputHash.length) {
    return "0x" + inputHash;
  } else {
    alert("Hash should start with 0x and be 66 characters long");
    return false;
  }
}

function validateOriginalMessage(message) {
  var parts = message.split(".");
  if(parts.length < 2) {
    alert("Text should be in the form seed words, comma and number. Ex: 'abcdefghijklmnoprst.6'.\
    Comma is not available in input.");
    return false;
  } else {
    var parsed = parseInt(parts[parts.length-1]);
    if (isNaN(parsed)) {
      alert("Text should be in the form seed words, comma and number. Ex: 'abcdefghijklmnoprst.6'.\
      Number is not decoded after comma.");
      return false;
    }
  }

  return true;
}
