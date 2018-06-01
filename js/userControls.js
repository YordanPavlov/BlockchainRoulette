var betsPositions = [];
var betsValues = [];
var sumBets = 0;
var blockNumberAtBet = 0;
var maxProfitPerNumber = [];

// We use numbers to note the non-number positions on the table
const FIRST_THIRD = 37;
const MIDDLE_THIRD = 38;
const LAST_THIRD = 39;
const FIRST_HALF = 40;
const SECOND_HALF = 41;
const ODDS = 42;
const EVENS = 43;
const REDS = 44;
const BLACKS = 45;

function verifyBetsArePayable() {
  // Init with 0
  for(var j=0; j<37; ++j) {
    maxProfitPerNumber[j] = 0;
  }
  for(var i = 0; i < betsPositions.length; ++i) {
      if(betsPositions[i] < 0) {
        console.error(betsPositions + " is not a valid position!");
      } else if (betsPositions[i] < 37) {
        maxProfitPerNumber[betsPositions[i]] += 36 * betsValues[i];
      } else if (FIRST_THIRD == betsPositions[i]) {
          for(var j=1; j<=12; ++j) {
            maxProfitPerNumber[j] += 3 * betsValues[i];
          }
      } else if (MIDDLE_THIRD == betsPositions[i]) {
          for(var j=13; j<=24; ++j) {
            maxProfitPerNumber[j] += 3 * betsValues[i];
          }
      } else if (LAST_THIRD == betsPositions[i]) {
          for(var j=25; j<=36; ++j) {
            maxProfitPerNumber[j] += 3 * betsValues[i];
          }
      } else if (FIRST_HALF == betsPositions[i]) {
          for(var j=1; j<=18; ++j) {
            maxProfitPerNumber[j] += 2 * betsValues[i];
          }
      } else if (SECOND_HALF == betsPositions[i]) {
          for(var j=19; j<=36; ++j) {
            maxProfitPerNumber[j] += 2 * betsValues[i];
          }
      } else if (ODDS == betsPositions[i] ||
                 EVENS == betsPositions[i]) {
          for(var j=1; j<=36; ++j) {
            var isOdd = j % 2;
            if ((ODDS == betsPositions[i] && isOdd) ||
                (EVENS == betsPositions[i] && !isOdd)) {
              maxProfitPerNumber[j] += 2 * betsValues[i];
            }
          }
      } else if (REDS == betsPositions[i]) {
        var redBet = betsValues[i];
        maxProfitPerNumber[1] += 2 * redBet;
        maxProfitPerNumber[3] += 2 * redBet;
        maxProfitPerNumber[5] += 2 * redBet;
        maxProfitPerNumber[7] += 2 * redBet;
        maxProfitPerNumber[9] += 2 * redBet;
        maxProfitPerNumber[12] += 2 * redBet;
        maxProfitPerNumber[14] += 2 * redBet;
        maxProfitPerNumber[16] += 2 * redBet;
        maxProfitPerNumber[18] += 2 * redBet;
        maxProfitPerNumber[19] += 2 * redBet;
        maxProfitPerNumber[21] += 2 * redBet;
        maxProfitPerNumber[23] += 2 * redBet;
        maxProfitPerNumber[25] += 2 * redBet;
        maxProfitPerNumber[27] += 2 * redBet;
        maxProfitPerNumber[30] += 2 * redBet;
        maxProfitPerNumber[32] += 2 * redBet;
        maxProfitPerNumber[34] += 2 * redBet;
        maxProfitPerNumber[36] += 2 * redBet;
      } else if (BLACKS == betsPositions[i]) {
        var blackBet = betsValues[i];
        maxProfitPerNumber[2] += 2 * blackBet;
        maxProfitPerNumber[4] += 2 * blackBet;
        maxProfitPerNumber[6] += 2 * blackBet;
        maxProfitPerNumber[8] += 2 * blackBet;
        maxProfitPerNumber[10] += 2 * blackBet;
        maxProfitPerNumber[11] += 2 * blackBet;
        maxProfitPerNumber[13] += 2 * blackBet;
        maxProfitPerNumber[15] += 2 * blackBet;
        maxProfitPerNumber[17] += 2 * blackBet;
        maxProfitPerNumber[20] += 2 * blackBet;
        maxProfitPerNumber[22] += 2 * blackBet;
        maxProfitPerNumber[24] += 2 * blackBet;
        maxProfitPerNumber[26] += 2 * blackBet;
        maxProfitPerNumber[28] += 2 * blackBet;
        maxProfitPerNumber[29] += 2 * blackBet;
        maxProfitPerNumber[31] += 2 * blackBet;
        maxProfitPerNumber[33] += 2 * blackBet;
        maxProfitPerNumber[35] += 2 * blackBet;
      }
  }

  var returnValues = [];
  returnValues[0] = 0;
  returnValues[1] = 0;

  for(var j=0; j<37; ++j) {
    if(maxProfitPerNumber[j] > returnValues[1]) {
      returnValues[1] = maxProfitPerNumber[j];
      returnValues[0] = j;
    }
  }

  return returnValues;
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

  if(accumulatedBets.length > 0) {
    accumulatedBets += "\n Totalling: " + sumBets + " Finney";
    var div = document.getElementById('listBets');
    div.innerText = accumulatedBets;
    //$("#listBets").textContent = accumulatedBets;
  } else {
    $("#listBets").text("No bets are made");
    return;
  }

  var mostProfitableBet = verifyBetsArePayable();
  $("#maxProfit").text("Your maximum possible profit is " + mostProfitableBet[1] + " on number " +
    mostProfitableBet[0]);

  if(mostProfitableBet[1] > contractBalance) {
    $("#notPayableWarning").text("At this moment, your maximum win is not payable by the contract!")
    $("#winsKnown").show();
  } else {
      $("#sendBetsButton").show();
  }

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
