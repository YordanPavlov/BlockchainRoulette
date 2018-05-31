var betsPositions = [];
var betsValues = [];
var sumBets = 0;
var blockNumberAtBet = 0;

function verifyBetsArePayable() {
  // Do this check in Web3 to safe gas
  // TODO handle multiple players playing simultaneous
  return true;
}

function calculateBets() {
  var prefix = "num";
  var suffix = "Input";
  betsPositions = [];
  betsValues = [];
  sumBets = 0;

  var accumulatedBets = "";
  for(var i = 1; i <= 36; ++i) {
    var curNumber = prefix + i + suffix;
    var inputBox = document.getElementById(curNumber);

    if(inputBox && inputBox.value > 0) {
      betsPositions.push(i);
      betsValues.push(parseInt(inputBox.value));
      sumBets += betsValues[betsValues.length-1];

      var curBet = "Bet " + inputBox.value + " on number " + i + "\n" ;
      accumulatedBets += curBet;
    }
  }

  if(!verifyBetsArePayable()) {
    // TODO print error
    return;
  }

  if(accumulatedBets.length > 0) {
    accumulatedBets += "\n Totalling: " + sumBets + " Finney";
    var div = document.getElementById('listBets');
    div.innerText = accumulatedBets;
    //$("#listBets").textContent = accumulatedBets;
  } else {
    $("#listBets").text("No bets are made");
    return;
  }

  $("#sendBetsButton").show();
}

function sendBets() {

  // This is going to take a while, so update the UI to let the user know
  // the transaction has been sent
  $("#txLastAction").text("Placing bet on the blockchain. This may take a while...");
  // Send the tx to our contract:

  return lottery.methods.placeBets(betsPositions, betsValues)
  .send({ from: userAccount, value: web3.toWei(sumBets, 'finney') })
  .on("receipt", function(receipt) {
    $("#txLastAction").text("Successfully placed bets!");
    web3.eth.getBlockNumber(function(error, result) {
      blockNumberAtBet = result;
    });
  })
  .on("error", function(error) {
    // Do something to alert the user their transaction has failed
    $("#txLastAction").text(error.toString().substring(0, 200));
    console.error(error);
  });
}

function claimBet() {
  return lottery.methods.claimBets()
  .send({ from: userAccount }, function(error, result) {
    if(result > 0) {
      $("#txLastAction").text("You have won " + result + " finney from your bet!");
    } else {
      $("#txLastAction").text("You have not won on your last bet.");
    }
  })
  .on("receipt", function(receipt) {
    $("#txLastAction").text("Bet is being claimed.");
    // Transaction was accepted into the blockchain, let's redraw the UI
  })
  .on("error", function(error) {
    // Do something to alert the user their transaction has failed
    $("#txLastAction").text(error.toString().substring(0, 200));
  });
}

function forgetBet() {
  return lottery.methods.clearBetsNoClaim()
  .send({ from: userAccount })
  .on("receipt", function(receipt) {
    offerBetting();
  });
}
