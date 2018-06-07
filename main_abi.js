var lotteryABI = [
    {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "number",
          "type": "uint8"
        },
        {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "claimWin",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "newBalance",
          "type": "uint256"
        }
      ],
      "name": "balanceUpdated",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "positions",
          "type": "uint8[10]"
        },
        {
          "name": "values",
          "type": "uint16[10]"
        },
        {
          "name": "length",
          "type": "uint8"
        }
      ],
      "name": "placeBets",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "clearBets",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "hasActiveBet",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "claimBets",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "checkBalance",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];
