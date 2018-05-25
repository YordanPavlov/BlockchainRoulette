pragma solidity ^0.4.19;


contract Lottery {

  struct Bet {
      uint8 position;
      uint value;
  }

  struct BetsUser {
    uint placementTime; // height of blockchain at the time of placement
    Bet[] bets;
    uint8 betsLength;
  }

  address owner;
  mapping (address => BetsUser) betsPerUser;
  mapping (address => uint) depositPerUser;

  // We are not going to clear the list of hashes so we need the 'real' size
  //uint public listHashesCurrentSize = 0;

  function Lottery() public {
    owner = msg.sender;
  }

  function placeBet(uint8 position) public payable {
      require(0 == betsPerUser[msg.sender].placementTime);
      require(position <= 49);
      require(msg.value <= 1 ether);
      Bet memory newBet = Bet(position, msg.value);
      //newBet.position = position;
      //newBet.value = msg.value;
      if(betsPerUser[msg.sender].bets.length > betsPerUser[msg.sender].betsLength) {
        // The array has been extended enough before.
          betsPerUser[msg.sender].bets[betsPerUser[msg.sender].betsLength] = newBet;
      } else {
        betsPerUser[msg.sender].bets.push(newBet);
      }
      ++betsPerUser[msg.sender].betsLength;
  }

  function finalizeBets() public {
      require(0 == betsPerUser[msg.sender].placementTime);
      betsPerUser[msg.sender].placementTime = block.number;
  }

  function clearBetsNoClaim() public {
    betsPerUser[msg.sender].placementTime = 0;
    betsPerUser[msg.sender].betsLength = 0;
  }

  function claimBets() public {
    uint placementTime = betsPerUser[msg.sender].placementTime;
    require(placementTime > 0 && placementTime <= block.number - 2);

    /* Make sure the hash is still visible
     *
     * "You can only access the hashes of the most recent 256 blocks, all other values will be zero."
     */
    uint blockHashRandomness = uint(block.blockhash(placementTime + 2));
    require(blockHashRandomness > 0);

    uint chosenNumber = blockHashRandomness % 37;

    for(uint8 index = 0; index < betsPerUser[msg.sender].betsLength; ++index) {
      if(betsPerUser[msg.sender].bets[index].position == chosenNumber) {
        // Win on exact number
        msg.sender.transfer(36 * betsPerUser[msg.sender].bets[index].value);
      }
      // TODO add other bet places
    }
  }

  function deposit() public payable {
    depositPerUser[msg.sender] += msg.value;
  }




}
