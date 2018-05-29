var lottery;
var userAccount;
var bettingStage = 0;
var betsRetrieved = 0;
var numBetsInContract = 0;
var gamePhaseBefore = -1;
var winnersRetrieved = 0;
var currentWinners = "";


function checkMetamaskAndStart() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3js = new Web3(web3.currentProvider);
  } else {
    alert("Missing Metamask plugin. Please install and login.");
    return;
  }

  var lotteryAddress = "0xc9efcb60a98af5cdf77ec8397b4d0493c542e8f7";
  lottery = new web3js.eth.Contract(lotteryABI, lotteryAddress);

  // web3 1.0 requires a websocket provider, which Metamask do not have yet (08.May.2018)
  //lottery.events.allEvents({ fromBlock: 'latest' }, console.log);

  web3js.eth.getAccounts(function(error, accounts) {
    if(error) {
        alert("Problem with accessing your Metamask account " + JSON.stringify(accounts));
    } else {
        userAccount = accounts[0];
    }
  });

  setTimeout(checkConnectivity, 5000);
  subscribeNewBlocks();
}

function checkConnectivity() {
  web3js.eth.net.isListening()
     .then(() => console.log('Connected'))
     .catch(e => console.log('Wow. Something went wrong'));

  lottery.methods.checkBalance().call(function (error, result) {
      if(0 == result) {
        alert("Problem connecting to contract or contract not ready.");
      }

      $("#txContractBalance").text("Contract balance is: " + result);
    });
}

// TODO add when Metamask provider supports it
function subscribeNewBlocks() {
    var subscription = web3js.eth.subscribe('newBlockHeaders', function(error, result){
      if (error) {
          console.error(error);
      }
  })
  .on("data", function(blockHeader){
    console.log(blockHeader);
  });

}
