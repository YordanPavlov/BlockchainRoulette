var lottery;
var userAccount;
var bettingStage = 0;
var betsRetrieved = 0;
var numBetsInContract = 0;
var gamePhaseBefore = -1;

function showAvailableBets(listOwners, listHashes) {
  var tableRef = document.getElementById('betsTable').getElementsByTagName('tbody')[0];

  for(var i =0; i < listHashes.length; ++i) {
    // Insert a row in the table at the last row
    var newRow   = tableRef.insertRow(tableRef.rows.length);

    // Insert a cell in the row at index 0
    var newCellOwner  = newRow.insertCell(0);
    // Append a text node to the cell
    var newTextOwner  = document.createTextNode(listOwners[i].toString());
    newCellOwner.appendChild(newTextOwner);

    // Insert a cell in the row at index 0
    var newCellHash  = newRow.insertCell(1);
    // Append a text node to the cell
    var newTextHash  = document.createTextNode(listHashes[i]);
    newCellHash.appendChild(newTextHash);
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

  var lotteryAddress = "0x43fe4dd63bdde0a6c6317f71946560b5b2ba98b6";
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

  /*lottery.events.NewBet({},{ fromBlock: 0, toBlock: 'latest' },
    function(error, event){ console.log(event); })
                .on('data', function(event){
                      console.log(event);
                })*/

  setTimeout(checkConnectivity, 5000);
  setInterval(rePrintChanges, 10000);
}

function checkConnectivity() {
  web3js.eth.net.isListening()
     .then(() => console.log('Connected'))
     .catch(e => console.log('Wow. Something went wrong'));

  lottery.methods.currentRoundTimestamp().call(function (error, result) {
      if(0 == result) {
        alert("Problem connecting to contract");
      }
    })
}

function eraseBetsTable() {
  var tableRef = document.getElementById('betsTable').getElementsByTagName('tbody')[0];

console.log("Rows num is" + tableRef.rows.length);
// Delete all rows but the first one, which we use as a header
 for(var i = tableRef.rows.length-1; i>0; --i) {
    tableRef.deleteRow(i);
  }
}

function checkForContractReset() {
  lottery.methods.bettingIteration().call(function (error, result) {
    // If the contract has been reset - all has to be reprinted
     if(result > bettingStage) {
       console.log("Betting iteration increased to: " + result);
       betsRetrieved = 0;


       bettingStage = result;
       //var currentWinner = document.getElementById("currentWinner");
       //currentWinner.style.display = "none";
       $(".winnerRevealed").css("display", "none");
       eraseBetsTable();
     }
   })
}

function rePrintChanges() {

     var listHashes = [];
     var listOwners = [];

     // Recurively iterate all bets
     function getHashFromContract() {
       lottery.methods.listHashes(betsRetrieved).call(function (error, result) {
         listHashes.push(result);
         ++betsRetrieved;

        // Get the owner of this new hash
         lottery.methods.getAddressOwner(result).call(function (error, resultOwner) {
           listOwners.push(resultOwner);

           if(betsRetrieved < numBetsInContract) {
             getHashFromContract();
           } else {
             showAvailableBets(listOwners, listHashes);
           }
         }
       )
       })
     }

     checkForContractReset();

     lottery.methods.gamePhase().call(function (error, gamePhaseNow) {
      // Checking all values from 0 upwards
      if(0 == gamePhaseNow) {
       $("#txStatus").text("Contract not yet initialized");
       return;
      }
      // result >= 1
      lottery.methods.currentRoundTimestamp().call(function (error, result) {
        var date = new Date(1000 * result);
        $("#txTimestamp").text(date.toString());
       })
      lottery.methods.hashWinningNumber().call(function (error, result) {
        $("#txWinningNumberHash").text(result);
      })
      // Check for new hashes
      lottery.methods.listHashesCurrentSize().call(function (error, result) {
           numBetsInContract = result;
           if(betsRetrieved < numBetsInContract) {
             getHashFromContract();
           }
           console.log("Bets retrieved is " + betsRetrieved);
      })
      if(!error && 1 == gamePhaseNow) {
        $("#txStatus").text("Accepting bets");
        return;
      }
      // result >=2 )
      lottery.methods.currentWinner().call(function (error, result) {
        $("#txCurrentWinner").text(result);
      })
      lottery.methods.closestDifference().call(function (error, result) {
        $("#txCurrentDifference").text(result);
      })
      if(2 == gamePhaseNow && gamePhaseNow != gamePhaseBefore) {
        lottery.methods.revealedNumber().call(function (error, result) {
          if(result > 0) {
            $("#txStatus").text("Winning number is revealed. Accepting claims.");
            $("#revealedNumber").text(result);
            $(".winnerRevealed").css("display", "block");
            //var currentWinner = document.getElementById("currentWinner");
            //currentWinner.style.display = "block";
        }})
        gamePhaseBefore = gamePhaseNow;
        return;
      }
      if(3 == gamePhaseNow &&  gamePhaseNow != gamePhaseBefore) {
        $("#winnerTitle").text("Final winner");
        $("#txStatus").text("Game over. Winner is chosen.");
      }
      gamePhaseBefore = gamePhaseNow;
    });


    var dateNow = new Date(Date.now());
    $("#txPageRefreshTime").text(dateNow.toString());

}
