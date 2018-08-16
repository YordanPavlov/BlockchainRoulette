var lottery;
var userAccount;
var contractBalance = 0;
var offerBettingOriginal;

const FINNEY_TO_WEI = 1000000000000000;
const MAX_CREDITORS = 10;

function checkMetamaskAndStartDeposit() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3js = new Web3(web3.currentProvider);
    //web3jsEvents = new Web3('ws://localhost:8545')
    //web3jsEvents = new Web3('wss://ropsten.infura.io/ws');
  } else {
    alert("Missing Metamask plugin. Please install and login.");
    return;
  }

  //var lotteryAddress = "0x2E86cd048BDFb15dBE96b21ACd8231Ed14ED14B6";
  var lotteryAddress = "0xda804bab18dc8e15b2b6377da7af800f43cdb624";
  lottery = new web3js.eth.Contract(lotteryABI, lotteryAddress);
  //lotteryEvents = new web3jsEvents.eth.Contract(lotteryABI, lotteryAddress);

  web3js.eth.getAccounts(function(error, accounts) {
    if(error) {
        alert("Problem with accessing your Metamask account " + JSON.stringify(accounts));
    } else {
        userAccount = accounts[0];
        if(userAccount > 0) {
          $("#initialError").hide();
          $("#initialError").text("Your address is: " + userAccount);
        }
    }
  });

  setInterval(printUserControlsAndCreditors, 5000);

}

function offerOwnerControls() {
  $("#ownerControls").show();
}

function offerDeposits()
{
  $("#creditorControls").show();
}

function printExistingCreditors() {

  lottery.methods.getCreditorsList().call(function (error, creditorsList) {
      if(error || 0 == creditorsList) {
        console.error("Problem getting creditors list.");
      } else {
        console.log(creditorsList);

          lottery.methods.getCreditorsPPM().call(function (error, creditorsPPM) {
              if(error || 0 == creditorsPPM) {
                console.error("Problem getting creditors PPM list.");
              } else {
                console.log(creditorsPPM);

                  var table     = document.createElement("table");
                  var tableBody = document.createElement('tbody');

                  var rowHead = tableBody.insertRow(0);
                  var cell1Head = rowHead.insertCell(0);
                  var cell2Head = rowHead.insertCell(1);
                  var cell3Head = rowHead.insertCell(2);

                  cell1Head.innerHTML = "Creditor";
                  cell2Head.innerHTML = "Value";
                  cell3Head.innerHTML = "Percent of total value";

                  for (var i = 0; i < MAX_CREDITORS; i++) {
                      if(!web3.toBigNumber(creditorsList[i]).isZero()) {
                        // Create an empty <tr> element and add it to the 1st position of the table:
                        var row = tableBody.insertRow(1);

                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);

                        cell1.innerText = creditorsList[i];
                        var ppm = creditorsPPM[i];
                        console.log("ppm for index " + i + " is " + ppm);
                        var valueFinney = contractBalance * ppm / 1000000;
                        cell2.innerText = valueFinney + " Finney";
                        // Reduce PPM to Percent
                        cell3.innerText = ppm / 10000 + "%";
                      }

                      if(userAccount == creditorsList[i]) {
                        offerDeposits();
                      }
                  }

                  table.appendChild(tableBody);
                  $("#deposits").replaceWith(table);
              }
            });
      }
    });
}

function printUserControlsAndCreditors() {
    lottery.methods.getOwner().call(function (error, result) {
        if(error || 0 == result) {
          alert("Problem connecting to contract or contract not ready.");
        } else {
            console.log("Owner is: " + result);

            if(result == userAccount){
              $("#userStatus").text("You are the contract owner.");
              offerOwnerControls();
            }
        }
      });

      printExistingCreditors();
      updateBalance();
}

function addNewCreditor() {
  var inputBox = document.getElementById("newCreditorId");

  if(inputBox) {
    console.log("New creditor to be added is: " + inputBox.value);
    lottery.methods.addCreditor(inputBox.value)
    .send({ from: userAccount })
    .on("error", function(error) {
      // Do something to alert the user their transaction has failed
      console.error(error);
    });
  } else {
    console.log("newCreditorId element is missing");
  }
}

function addNewCreditor() {
  var inputBox = document.getElementById("newCreditorId");

  if(inputBox) {
    console.log("New creditor to be added is: " + inputBox.value);
    lottery.methods.addCreditor(inputBox.value)
    .send({ from: userAccount })
    .on("error", function(error) {
      // Do something to alert the user their transaction has failed
      console.error(error);
    });
  } else {
    console.log("newCreditorId element is missing");
  }
}

function deposit() {
  var inputBox = document.getElementById("depositFinneyId");

  if(inputBox) {
    var depositInt = parseInt(inputBox.value);
    console.log("New deposit to be added is: " + depositInt);
    lottery.methods.depositAction(depositInt)
    .send({ from: userAccount, value: web3.toWei(depositInt, 'finney') })
    .on("error", function(error) {
      // Do something to alert the user their transaction has failed
      console.error(error);
    });
  } else {
    console.log("depositFinneyId element is missing");
  }
}

function withdraw() {
  var inputBox = document.getElementById("withdrawFinneyId");
  if(inputBox) {
    var withdrawInt = parseInt(inputBox.value);
    console.log("New withdraw in the amount of: " + withdrawInt);
    lottery.methods.depositAction(withdrawInt * -1)
    .send({ from: userAccount })
    .on("error", function(error) {
      // Do something to alert the user their transaction has failed
      console.error(error);
    });
  } else {
    console.log("withdrawFinneyId element is missing");
  }
}

function updateBalance(newBalance) {
  lottery.methods.checkBalance().call(function (error, result) {
      if(error) {
        console.error(error);
        alert("Problem connecting to contract or contract not ready.");
      } else {
          contractBalance = result / FINNEY_TO_WEI;
          $("#contractBalance").text("Contract balance is: " + contractBalance + " finney");
      }
    });
}

function hideWins() {
  $("#txWinsNumber").hide();
  $("#winsKnown").hide();
}
