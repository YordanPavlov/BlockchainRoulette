var lottery;
var userAccount;
var bettingStage = 0;
var betsRetrieved = 0;
var numBetsInContract = 0;
var revealedNumber = 0;
var finalWinner = 0;

function showAvailableBets(listHashes) {
  var tableRef = document.getElementById('betsTable').getElementsByTagName('tbody')[0];



  for(var i =0; i < listHashes.length; ++i) {
    // Insert a row in the table at the last row
    var newRow   = tableRef.insertRow(tableRef.rows.length);

    // Insert a cell in the row at index 0
    var newCell  = newRow.insertCell(0);

    // Append a text node to the cell

    var newText  = document.createTextNode(listHashes[i]);
    newCell.appendChild(newText);
  }
}

function checkMetamaskAndStart() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3js = new Web3(web3.currentProvider);
  } else {
    alert("Missing Metamask plugin. Please install and login.");
    return;
  }

/*  web3js.eth.isListening()
  .then(function(result) {
    if(!result) {
      alert("Not connected to Ethereum network. Check Metamask settings.");
      return;
    }
  }
);*/

  var lotteryAddress = "0x7fc58f2adf0aaa8662489b3f78c0764b8b94ab74";
  lottery = new web3js.eth.Contract(lotteryABI, lotteryAddress);

  // web3 1.0 requires a websocket provider, which Metamask do not have yet (08.May.2018)
  //lottery.events.allEvents({ fromBlock: 'latest' }, console.log);

  web3js.eth.getAccounts(function(error, accounts) {
    if(!error) {
        alert("Problem with accessing your Metamask account" + JSON.stringify(result));
    } else {
        userAccount = accounts[0];
    }
  });

  web3js.eth.net.isListening()
     .then(() => console.log('Connected'))
     .catch(e => console.log('Wow. Something went wrong'));

  lottery.methods.currentRoundTimestamp().call(function (error, result) {
      var date = new Date(1000 * result);
      $("#txTimestamp").text(date.toString());
    }
  )

  /*lottery.events.NewBet({},{ fromBlock: 0, toBlock: 'latest' },
    function(error, event){ console.log(event); })
                .on('data', function(event){
                      console.log(event);
                })*/

  setInterval(rePrintBets, 10000);
}

function eraseBetsTable() {
  var tableRef = document.getElementById('betsTable').getElementsByTagName('tbody')[0];

console.log("Rows num is" + tableRef.rows.length);
// Delete all rows but the first one, which we use as a header
 for(var i = tableRef.rows.length-1; i>0; --i) {
    tableRef.deleteRow(i);
  }
}

function rePrintBets() {

     var listHashes = [];

     function getHashFromContract() {
       lottery.methods.listHashes(betsRetrieved).call(function (error, result) {
         listHashes.push(result);
         ++betsRetrieved;
         if(betsRetrieved < numBetsInContract) {
           getHashFromContract();
         } else {

           showAvailableBets(listHashes);
         }
       })
     }

     lottery.methods.bettingIteration().call(function (error, result) {
       // If the contract has been reset - all has to be reprinted
       console.log("Betting iteration is " + result);
        if(result > bettingStage) {
          betsRetrieved = 0;
          revealedNumber = 0;
          revealedNumber = 0;
          finalWinner = 0;
          bettingStage = result;
          eraseBetsTable();
        }

        // If we are still accepting new bets - check for such
        if(0 == revealedNumber) {
          lottery.methods.revealedNumber().call(function (error, result) {
            if(result > 0) {
              revealedNumber = result;
              $("#revealedNumber").text("Chosen number is revealed as " + result);
            }
          })

          // Check for new hashes
          lottery.methods.listHashesCurrentSize().call(function (error, result) {
               numBetsInContract = result;
               if(betsRetrieved < numBetsInContract) {
                 getHashFromContract();
               }
          })
        } else if(0 == finalWinner){
           lottery.methods.gamePhase().call(function (error, result) {
               if(2 == result) {
                 lottery.methods.currentWinner().call(function (error, result) {
                   finalWinner = result;
                   lottery.methods.closestDifference().call(function (error, result) {
                     var finalDifference = result;

                     $("#chosenWinner").text("Chosen winner is: " + finalWinner +
                     "with difference of " + finalDifference);
                 })
               })
              }
          })
        }

   })
}
