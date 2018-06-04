var lottery;
var userAccount;
var contractBalance = 0;
var offerBettingOriginal;

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

  var lotteryAddress = "0x5f30fd06d2c553dade442bc6a29201d6258a91e3";
  lottery = new web3js.eth.Contract(lotteryABI, lotteryAddress);
  lotteryEvents = new web3jsEvents.eth.Contract(lotteryABI, lotteryAddress);

  // web3 1.0 requires a websocket provider, which Metamask do not have yet (08.May.2018)
  //lottery.events.allEvents({ fromBlock: 'latest' }, console.log);

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
    console.log(blockHeader.number);
    if(blockNumberAtBet > 0) {
      if(blockHeader.number > blockNumberAtBet) {
        blockNumberAtBet = 0;
        offerClaiming();
      }
    }
  });

  //setInterval(printBlockNumber, 10000);
}

function watchWins() {
  //var event = web3jsEvents.claimWin({from: userAccount});
  var event = lotteryEvents.events.claimWin({from: userAccount}, function(error, result){
    if (!error){
      if(result.returnValues.value > 0){
        $("#txWins").text("Congratulations! You have won " + result.returnValues.value + " finney!")
      } else {
        $("#txWins").text("No win on your last bet.")
      }
      $("#txWinsNumber").text("Winning number chosen was: " + result.returnValues.number);
      $("#winsKnown").show();
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

function hasActiveBet() {
  lottery.methods.hasActiveBet().call(function (error, result) {
      $("#initialError").hide();
      if(result) {
        offerClaiming();
      } else {
        offerBetting();
      }
    })
}

function updateBalance(newBalance) {
  contractBalance = newBalance / FINNEY_TO_WEI;
  $("#txContractBalance").text("Contract balance is: " + contractBalance + " finney");
}

function reloadBetting() {
  $("#offerBetting").replaceWith(offerBettingOriginal.clone())
  offerBetting();
}

function offerBetting() {
  $("#claimBetsButtons").hide();
  $("#offerBetting").show();
}

function offerClaiming() {
  $("#offerBetting").hide();
  $("#claimBetsButtons").show();
}
