pragma solidity ^0.4.23;


contract Lottery {

  struct BetsUser {
    uint placementTime; // height of blockchain at the time of placement
    uint8[MAX_BETTING_AT_ONCE] positions;
    uint16[MAX_BETTING_AT_ONCE] values;
    uint8 betsLength;
  }

  address owner;
  mapping (address => BetsUser) betsPerUser;
  uint8 constant NUM_BETTING_POSITIONS = 49;
  uint8 constant MAX_BETTING_AT_ONCE = 10;
  uint16 constant MAX_BET_FINNEY = 999;
  uint constant FINNEY_TO_WEI = 1000000000000000;

  uint8 constant FIRST_COLLUMN = 37;
  uint8 constant SECOND_COLLUMN = 38;
  uint8 constant THIRD_COLLUMN = 39;
  uint8 constant FIRST_THIRD = 40;
  uint8 constant MIDDLE_THIRD = 41;
  uint8 constant LAST_THIRD = 42;
  uint8 constant FIRST_HALF = 43;
  uint8 constant SECOND_HALF = 44;
  uint8 constant ODDS = 45;
  uint8 constant EVENS = 46;
  uint8 constant REDS = 47;
  uint8 constant BLACKS = 48;

  // We are not going to clear the list of hashes so we need the 'real' size
  //uint public listHashesCurrentSize = 0;

  constructor() public {
    owner = msg.sender;
  }

  function placeBets(uint8[MAX_BETTING_AT_ONCE] positions,
                    uint16[MAX_BETTING_AT_ONCE] values,
                    uint8 length) public payable {
      require(0 == betsPerUser[msg.sender].placementTime);
      require(positions.length == values.length);
      require(positions.length <= MAX_BETTING_AT_ONCE);

      uint16 sumValues = 0;
      for(uint8 index = 0; index < length; ++index) {
        require(positions[index] <= NUM_BETTING_POSITIONS);
        require(values[index] <= MAX_BET_FINNEY);
        sumValues += values[index];
      }
      // Make sure that the sum of the bets equals what has been paid to the method
      require(msg.value == FINNEY_TO_WEI * sumValues);

      betsPerUser[msg.sender].positions = positions;
      betsPerUser[msg.sender].values = values;
      betsPerUser[msg.sender].placementTime = block.number;
      betsPerUser[msg.sender].betsLength = length;
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
      uint8 curBetPosition = betsPerUser[msg.sender].positions[index];
      uint16 curBetValue = betsPerUser[msg.sender].values[index];
      if(curBetPosition <= 36) {
        if(curBetPosition == chosenNumber) {
          // Win on exact number
          profitFinney += 36 * curBetValue;
        }
      } else {
        // The current bet is not a number, check group bets
        if (( FIRST_COLLUMN == curBetPosition && 1 == (chosenNumber % 3)) ||
            ( SECOND_COLLUMN == curBetPosition && 2 == (chosenNumber % 3)) ||
            ( THIRD_COLLUMN == curBetPosition && 0 == (chosenNumber % 3)) ||
            ( FIRST_THIRD == curBetPosition && (chosenNumber >= 1 && chosenNumber <= 12)) ||
            ( MIDDLE_THIRD == curBetPosition && (chosenNumber >= 13 && chosenNumber <= 24)) ||
            ( LAST_THIRD == curBetPosition && (chosenNumber >= 25 && chosenNumber <= 36)))
        {
                profitFinney += 3 * curBetValue;
        }
      }


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
