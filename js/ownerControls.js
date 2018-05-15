function reset() {
  var resetHash = document.getElementById('resetInput').value;
  // This is going to take a while, so update the UI to let the user know
  // the transaction has been sent
  $("#txLastAction").text("Resetting winning hash to " + resetHash + ". This may take a while...");
  // Send the tx to our contract:
  console.log(resetHash);
  return lottery.methods.reset(resetHash)
  .send({ from: userAccount })
  .on("receipt", function(receipt) {
    $("#txLastAction").text("Successfully reset contract with new hash " + resetHash + "!");
    // Transaction was accepted into the blockchain, let's redraw the UI
    // TODO show bets
  })
  .on("error", function(error) {
    // Do something to alert the user their transaction has failed
    $("#txLastAction").text(error);
  });
}

function revealNumber() {
  var revealedNumberHash = document.getElementById('revealWinning').value;
  return lottery.methods.revealNumber(revealedNumberHash)
  .send({ from: userAccount })
  .on("receipt", function(receipt) {
    $("#txLastAction").text("Winning number is now revealed!");
    // Transaction was accepted into the blockchain, let's redraw the UI
  })
  .on("error", function(errorResult) {
    // Print only the first 100 characters as the errors tend to be very long
    $("#txLastAction").text(errorResult.toString().substring(0, 100));
  });
}

function awardWinner() {
  return lottery.methods.awardWinner()
  .send({ from: userAccount })
  .on("receipt", function(receipt) {
    $("#txLastAction").text("Winner is rewarded.");
    // Transaction was accepted into the blockchain, let's redraw the UI
  })
  .on("error", function(error) {
    // Do something to alert the user their transaction has failed
    $("#txLastAction").text(error.toString().substring(0, 100));
  });
}
