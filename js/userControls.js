const MAX_BETTING_AT_ONCE = 10;
const MAX_BETTING_VALUE = 1000;
var betsPositions = [];
var betsValues = [];
var sumBets = 0;
var blockNumberAtBet = 0;
var maxProfitPerNumber = [];

// We use numbers to note the non-number positions on the table
const FIRST_COLLUMN = 37;
const SECOND_COLLUMN = 38;
const THIRD_COLLUMN = 39;
const FIRST_THIRD = 40;
const MIDDLE_THIRD = 41;
const LAST_THIRD = 42;
const FIRST_HALF = 43;
const SECOND_HALF = 44;
const ODDS = 45;
const EVENS = 46;
const REDS = 47;
const BLACKS = 48;

function iterateThirdWithStep(step, betValue) {
  for(var j=0; j<12; ++j) {
    maxProfitPerNumber[3*j + step] += 3 * betValue;
  }
}

function iterateThird(rangeStart, rangeEnd, betValue) {
  for(var j=rangeStart; j<=rangeEnd; ++j) {
    maxProfitPerNumber[j] += 3 * betValue;
  }
}
/**
 * Return an array of two. First element is also an array - of the positions where maximum profit
 * is achieved. Second element is the value of the maximum profit.
 */
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
      } else if (FIRST_COLLUMN == betsPositions[i]) {
        iterateThirdWithStep(1, betsValues[i]);
      } else if (SECOND_COLLUMN == betsPositions[i]) {
          iterateThirdWithStep(2, betsValues[i]);
      } else if (THIRD_COLLUMN == betsPositions[i]) {
          iterateThirdWithStep(3, betsValues[i]);
      } else if (FIRST_THIRD == betsPositions[i]) {
          iterateThird(1, 12, betsValues[i]);
      } else if (MIDDLE_THIRD == betsPositions[i]) {
          iterateThird(13, 24, betsValues[i]);
      } else if (LAST_THIRD == betsPositions[i]) {
          iterateThird(25, 36, betsValues[i]);
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
  returnValues[0] = [];
  returnValues[1] = 0;

  for(var j=0; j<37; ++j) {
    if(maxProfitPerNumber[j] > returnValues[1]) {
      // On this number the profit is better than before. Erase previous.
      returnValues[1] = maxProfitPerNumber[j];
      returnValues[0] = [j];
    } else if(maxProfitPerNumber[j] == returnValues[1]) {
      // This number equals the best profit. Add it.
      returnValues[0].push(j);
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
  for(var index = 0; index <= 48; ++index) {
    var curNumber = prefix + index + suffix;
    var inputBox = document.getElementById(curNumber);

    if(inputBox && inputBox.value > 0) {
      betsPositions.push(index);
      betsValues.push(parseInt(inputBox.value));
      sumBets += betsValues[betsValues.length - 1];

      var curBet;
      if(index <= 36) {
          curBet = "Bet " + inputBox.value + " Finney on number " + index + "\n";
      } else if (FIRST_COLLUMN == index) {
          curBet = "Bet " + inputBox.value + " on first collumn \n";
      } else if (SECOND_COLLUMN == index) {
          curBet = "Bet " + inputBox.value + " on second collumn \n";
      } else if (THIRD_COLLUMN == index) {
          curBet = "Bet " + inputBox.value + " on third collumn \n";
      } else if (FIRST_THIRD == index) {
          curBet = "Bet " + inputBox.value + " on first third \n";
      } else if (MIDDLE_THIRD == index) {
          curBet = "Bet " + inputBox.value + " on middle third \n";
      } else if (LAST_THIRD == index) {
          curBet = "Bet " + inputBox.value + " on last third \n";
      } else if (FIRST_HALF == index) {
          curBet = "Bet " + inputBox.value + " on first half \n";
      } else if (SECOND_HALF == index) {
          curBet = "Bet " + inputBox.value + " on second half \n";
      } else if (ODDS == index) {
          curBet = "Bet " + inputBox.value + " on odd numbers \n";
      } else if (EVENS == index) {
          curBet = "Bet " + inputBox.value + " on even numbers \n";
      } else if (REDS == index) {
          curBet = "Bet " + inputBox.value + " on red numbers \n";
      } else if (BLACKS == index) {
          curBet = "Bet " + inputBox.value + " on black numbers \n";
      }

      accumulatedBets += curBet;
    }
  }

  var sumValues = 0;
  for(var indexValues = 0; indexValues < betsValues.length; ++indexValues) {
    sumValues += betsValues[indexValues];
  }

  if(betsPositions.length > MAX_BETTING_AT_ONCE) {
    $("#listBets").text("The number of bets exceeds the current maximum number of " + MAX_BETTING_AT_ONCE);
    return;
  } else if (sumValues > MAX_BETTING_VALUE ) {
    $("#listBets").text("The sum of your betting value exceeds the current maximum " + MAX_BETTING_VALUE);
    return;
  }else if(betsPositions.length == 0) {
    $("#listBets").text("No bets are made");
    return;
  } else {
    accumulatedBets += "Totalling: " + sumBets + " Finney";
    var div = document.getElementById('listBets');
    div.innerText = accumulatedBets;
  }

  var mostProfitableBet = verifyBetsArePayable();
  var maxProfitText = "Your maximum possible profit is " + mostProfitableBet[1] + " on";
  if(1 == mostProfitableBet[0].length) {
    maxProfitText += " number ";
    maxProfitText += mostProfitableBet[0][0];
  } else {
    maxProfitText += " numbers ";
    maxProfitText += mostProfitableBet[0][0];
    for(var indexProfit = 1; indexProfit < mostProfitableBet[0].length; ++indexProfit) {
      maxProfitText += ", ";
      maxProfitText += mostProfitableBet[0][indexProfit];
    }
  }
  $("#maxProfit").text(maxProfitText);

  if(mostProfitableBet[1] > contractBalance) {
    notPayableState();
  } else {
    sendOrResetState();
  }

}

function sendBets() {

  // This is going to take a while, so update the UI to let the user know
  // the transaction has been sent
  $("#txLastAction").text("Placing bet on the blockchain. This may take a while...");
  // Send the tx to our contract:

  var fixedSizeBetsPositions = [0,0,0,0,0,0,0,0,0,0];
  var fixedSizeBetsValues = [0,0,0,0,0,0,0,0,0,0];
  for(var i=0; i<betsPositions.length; ++i) {
    fixedSizeBetsPositions[i] = betsPositions[i];
    fixedSizeBetsValues[i] = betsValues[i];
  }
  lottery.methods.placeBets(fixedSizeBetsPositions, fixedSizeBetsValues, betsPositions.length)
  .send({ from: userAccount, value: web3.toWei(sumBets, 'finney') })
  .on("receipt", function(receipt) {
    web3.eth.getBlockNumber(function(error, result) {
      blockNumberAtBet = result;
      waitWinningBlock();
    });
  })
  .on("error", function(error) {
    // Do something to alert the user their transaction has failed
    $("#txLastAction").text(error.toString().substring(0, 200));
    console.error(error);
  });
  waitNextBlockState();
}

function claimBet() {
  lottery.methods.claimBets()
  .send({ from: userAccount })
  .on("receipt", function(receipt) {
    $("#txLastAction").text("Bet is being claimed.");
    winAnnounceState(receipt.events.claimWin.returnValues);
    // Transaction was accepted into the blockchain, let's redraw the UI
  })
  .on("error", function(error) {
    // Do something to alert the user their transaction has failed
    $("#txLastAction").text(error.toString().substring(0, 200));
  });
  claimDoneState();
}
