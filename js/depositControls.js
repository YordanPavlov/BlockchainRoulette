var lottery;
var userAccount;
var contractBalance = 0;
var offerBettingOriginal;

const FINNEY_TO_WEI = 1000000000000000;
const MAX_CREDITORS = 10;
const INITIAL_USER_STATUS = "Not a creditor."

function checkMetamaskAndStartAll() {

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
  var lotteryAddress = "0x795476a218e18b375202cd9a4523615a4228565d";
  lottery = new web3js.eth.Contract(lotteryABI, lotteryAddress);
  //lotteryEvents = new web3jsEvents.eth.Contract(lotteryABI, lotteryAddress);

  web3js.eth.getAccounts(function(error, accounts) {
    if(error) {
        alert("Problem with accessing your Metamask account " + JSON.stringify(accounts));
    } else {
        userAccount = accounts[0];
        if(userAccount > 0) {
          $("#initialError").hide();
          $("#userAddress").text(userAccount);
        }
    }
  });

  setTimeout(printUserControlsAndCreditors, 5000);

}

function offerOwnerControls() {
  //$("#ownerControls").show();
  $('#ownerControls').css('display', 'flex')
}

function offerDeposits()
{
  if(document.getElementById("userStatus").innerText === INITIAL_USER_STATUS) {
      $("#userStatus").text("You are a creditor.");
  } else {
    $("#userStatus").append("You are a creditor.");
  }

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

                  var newDepositDataField = document.createElement('div');
                  newDepositDataField.id = 'depositDataField';

                  for (var i = 0; i < MAX_CREDITORS; i++) {
                      if(!web3.toBigNumber(creditorsList[i]).isZero()) {
                        var newOneLineDiv = document.createElement('div');
                        newOneLineDiv.className = 'oneLineContainerEmbeded';

                        var cell1 = document.createElement('div');
                        cell1.className = 'tableFirstRow';
                        var cell2 = document.createElement('div');
                        cell2.className = 'tableSecondRow';
                        var cell3 = document.createElement('div');
                        cell3.className = 'tableThirdRow';

                        cell1.innerText = creditorsList[i];
                        var ppm = creditorsPPM[i];
                        console.log("ppm for index " + i + " is " + ppm);
                        var valueFinney = contractBalance * ppm / 1000000;
                        cell2.innerText = valueFinney + " Finney";
                        // Reduce PPM to Percent
                        cell3.innerText = ppm / 10000 + "%";

                        newOneLineDiv.appendChild((cell1));
                        newOneLineDiv.appendChild((cell2));
                        newOneLineDiv.appendChild((cell3));

                        newDepositDataField.appendChild(newOneLineDiv);
                      }

                      if(userAccount == creditorsList[i]) {
                        offerDeposits();
                      }
                  }

                  $("#depositDataField").replaceWith(newDepositDataField);
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
              $("#userStatus").text("You are the contract owner. ");
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
          $("#contractBalance").text(contractBalance + " finney");
      }
    });
}

function hideWins() {
  $("#txWinsNumber").hide();
  $("#winsKnown").hide();
}
