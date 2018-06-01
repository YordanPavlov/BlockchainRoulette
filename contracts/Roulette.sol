pragma solidity ^0.4.23;


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
  uint8 constant NUM_BETTING_POSITIONS = 49;
  uint16 constant MAX_BET_FINNEY = 999;
  uint constant FINNEY_TO_WEI = 1000000000000000;

  // We are not going to clear the list of hashes so we need the 'real' size
  //uint public listHashesCurrentSize = 0;

  constructor() public {
    owner = msg.sender;
  }

  function placeBets(uint8[] positions, uint16[] values) public payable {
      require(0 == betsPerUser[msg.sender].placementTime);
      require(positions.length == values.length);
      require(positions.length <= NUM_BETTING_POSITIONS);

      uint16 sumValues = 0;
      for(uint8 index = 0; index < values.length; ++index) {
        require(positions[index] <= NUM_BETTING_POSITIONS);
        require(values[index] <= MAX_BET_FINNEY);
        sumValues += values[index];
        Bet memory newBet = Bet(positions[index], values[index]);
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
      // Make sure that the sum of the bets equals what has been paid to the method
      require(msg.value == FINNEY_TO_WEI * sumValues);
      betsPerUser[msg.sender].placementTime = block.number;
  }

  function clearBets() public {
    betsPerUser[msg.sender].placementTime = 0;
    betsPerUser[msg.sender].betsLength = 0;
  }

  function hasActiveBet() public view returns (bool) {
    return betsPerUser[msg.sender].placementTime > 0;
  }

  function claimBets() public {
    uint placementTime = betsPerUser[msg.sender].placementTime;
    require(placementTime > 0 && placementTime <= block.number - 2);

    /* Make sure the hash is still visible
     *
     * "You can only access the hashes of the most recent 256 blocks, all other values will be zero."
     */
    uint blockHashRandomness = uint(blockhash(placementTime + 2));
    require(blockHashRandomness > 0);

    uint8 chosenNumber = uint8( blockHashRandomness % 37);

    uint profitFinney = 0;
    for(uint8 index = 0; index < betsPerUser[msg.sender].betsLength; ++index) {
      if(betsPerUser[msg.sender].bets[index].position == chosenNumber) {
        // Win on exact number
        profitFinney = 36 * betsPerUser[msg.sender].bets[index].value;
        break;
      }
      // TODO add other bet places
    }
    if(profitFinney > 0) {
      msg.sender.transfer(profitFinney * FINNEY_TO_WEI);
    }

    clearBets();
    emit claimWin(msg.sender, chosenNumber, profitFinney);
    emit balanceUpdated(address(this).balance);
  }

  event claimWin(address from, uint8 number, uint value);
  event balanceUpdated(uint newBalance);

  function deposit() public payable {
    emit balanceUpdated(address(this).balance);
  }

  function checkBalance() public view returns (uint) {
    return address(this).balance;
  }




}
