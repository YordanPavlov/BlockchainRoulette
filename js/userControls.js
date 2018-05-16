function claimBet() {
  var claimBet = document.getElementById('claimBet').value;
  if(!validateOriginalMessage(claimBet)) {
    return;
  }
  return lottery.methods.claimBet(claimBet)
  .send({ from: userAccount })
  .on("receipt", function(receipt) {
    $("#txLastAction").text("Bet is being claimed.");
    // Transaction was accepted into the blockchain, let's redraw the UI
  })
  .on("error", function(error) {
    // Do something to alert the user their transaction has failed
    $("#txLastAction").text(error.toString().substring(0, 100));
  });
}


function placeBet() {
  var hashBet = document.getElementById('placeBetInput').value;
  // This is going to take a while, so update the UI to let the user know
  // the transaction has been sent
  $("#txLastAction").text("Placing bet on the blockchain. This may take a while...");
  // Send the tx to our contract:

  return lottery.methods.acceptBet(hashBet)
  .send({ from: userAccount, value: web3.toWei(1, 'ether') })
  .on("receipt", function(receipt) {
    $("#txLastAction").text("Successfully placed bet with hash " + hashBet + "!");
    // Transaction was accepted into the blockchain, let's redraw the UI
    // TODO show bets
    //showBets();
    //getZombiesByOwner(userAccount).then(displayZombies);
  })
  .on("error", function(error) {
    // Do something to alert the user their transaction has failed
    $("#txLastAction").text(error.toString().substring(0, 100));
  });
}
