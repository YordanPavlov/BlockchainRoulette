var lottery;
var userAccount;
var contractBalance = 0;
var offerBettingOriginal;
var lastCreatedInput;

const FINNEY_TO_WEI = 1000000000000000;

function checkMetamaskAndStart() {
  offerBettingOriginal = $("#offerBetting").clone();

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3js = new Web3(web3.currentProvider);
    web3jsEvents = new Web3('ws://localhost:8545')
  } else {
    alert("Missing Metamask plugin. Please install and login.");
    return;
  }

  var lotteryAddress = "0xcd175ede74b1c2b56564d77d2c0c0a78b8950b45";
  lottery = new web3js.eth.Contract(lotteryABI, lotteryAddress);
  lotteryEvents = new web3jsEvents.eth.Contract(lotteryABI, lotteryAddress);

  web3js.eth.getAccounts(function(error, accounts) {
    if(error) {
        alert("Problem with accessing your Metamask account " + JSON.stringify(accounts));
    } else {
        userAccount = accounts[0];
    }
  });

  setTimeout(checkConnectivity, 400);
  setTimeout(hasActiveBet, 500);
  subscribeNewBlocks();
  watchWins();
  watchBalance();
}

function checkConnectivity() {
  web3js.eth.net.isListening()
    .then(() => console.log('Connected Metamask'))
    .catch(e => console.log('Wow. Something went wrong. Metamask'));

  web3jsEvents.eth.net.isListening()
    .then(() => console.log('Connected Events provider'))
    .catch(e => console.log('Wow. Something went wrong. Events provider'));

  lottery.methods.checkBalance().call(function (error, result) {
      if(error || 0 == result) {
        alert("Problem connecting to contract or contract not ready.");
      }
      updateBalance(result);
    });
}

function subscribeNewBlocks() {
    var subscription = web3jsEvents.eth.subscribe('newBlockHeaders', function(error, result){
      if (error) {
          console.error(error);
      }
  })
  .on("data", function(blockHeader){
    if(blockNumberAtBet > 0) {
      if(blockHeader.number > blockNumberAtBet + 1) {
        blockNumberAtBet = 0;
        lastNumberPicked = blockHeader.hash % 37;
        offerClaimState();
      }
    }
  });

  //setInterval(printBlockNumber, 10000);
}

function watchWins() {
  //var event = web3jsEvents.claimWin({from: userAccount});
  var event = lotteryEvents.events.claimWin({from: userAccount}, function(error, result){
    if (!error){
      winAnnounceState(result.returnValues.value);

    } else {
      console.error(error);
    }

  });
}

function watchBalance() {
  //var event = web3jsEvents.claimWin({from: userAccount});
  var event = lotteryEvents.events.balanceUpdated(function(error, result){
    if (!error){
      updateBalance(result.returnValues.newBalance);
    } else {
      console.error(error);
    }
  })
}

// Load correct game phase on reload
function hasActiveBet() {
  lottery.methods.hasActiveBet().call(function (error, result) {
      $("#initialError").hide();
      if(result > 0) {
        // Restore the moment the bet was made from the contract
        blockNumberAtBet = result;
        waitNextBlockState();
      } else {
        initialBettingState();
      }
    })
}

function updateBalance(newBalance) {
  contractBalance = newBalance / FINNEY_TO_WEI;
  $("#txContractBalance").text("Contract balance is: " + contractBalance + " finney");
}

function hideWins() {
  $("#txWinsNumber").hide();
  $("#winsKnown").hide();
}

function reloadBetting() {
  $("#offerBetting").replaceWith(offerBettingOriginal.clone())
  initialBettingState();
}

function initialBettingState() {
  $("#claimBetsButtons").hide();
  hideWins();
  $("#txLastAction").text("Expecting your bet.")
  $("#offerBetting").show();
  attachClickable();
}

function sendOrResetState() {
    $("#sendBetsButton").show();
    $("#reloadBettingButton").show();
    $("#txLastAction").text("Send your bets or start over.")
}

function waitNextBlockState() {
  $("#offerBetting").hide();
  $("#reloadBettingButton").hide();
  $("#txLastAction").text("Waiting for next block for bet to become claimable.")
}

function offerClaimState() {
  $("#offerBetting").hide();
  $("#claimBetsButtons").show();
  $("#reloadBettingButton").hide();
  $("#txLastAction").text("Next block is mined. Winning number is " + lastNumberPicked);
  $("#offerBetting").show();
}

function winAnnounceState(winValue) {
  if(winValue > 0){
    $("#txWins").text("Congratulations! You have won " + winValue + " finney!")
  } else {
    $("#txWins").text("No win on your last bet.")
  }
  $("#txWinsNumber").show();
  $("#txWinsNumber").text("Winning number chosen was: " + winValue);
  $("#winsKnown").show();
  $("#reloadBettingButton").show();
  $("#claimBetsButtons").hide();
}

function notPayableState() {
  $("#txLastAction").text("At this moment, your maximum win is not payable by the contract!")
  $("reloadBettingButton").show();
}

function attachClickable() {
  $("#offerBetting").on("click", ".rouletteNumber", function () {
    if ($(this).children().length > 1) {
      // We have already inserted input element
      return;
    }
    removeLastCreatedInputIfEmpty();
    var inputId = $(this).attr("id") + 'Input';
    var input = $('<input />', {
        'type': 'text',
        'id': inputId,
        'class': 'rouletteBetInput',
        'maxlength': '4',
        'size': '4'
    });
    //$(this).replaceWith(input);
    $(this).append(input);
    lastCreatedInput = inputId;

    //console.log("Generate input with id " + inputId);
  })
}

function removeLastCreatedInputIfEmpty() {
  var inputBox = document.getElementById(lastCreatedInput);

  if(inputBox && inputBox.value == 0) {
    $('#' + lastCreatedInput).remove();
  }
}

function removeAllClickable() {
  document.getElementById('offerBetting').removeAttribute("onclick");
}
