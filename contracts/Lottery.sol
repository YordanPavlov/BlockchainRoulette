pragma solidity ^0.4.19;


contract Lottery {

  struct BetSender {
      address beneficiary;
      uint iterationStamp;
  }

  enum GamePhase {
    NOT_INITIALIZED, // 0 - used only when initially deployed
    ACCEPTING_BETS,  // 1
    WINNER_REVEALED, // 2 - bets are not accepted only claims
    WINNER_CHOSEN}   // 3 - winner is chosen among claims

  GamePhase public gamePhase = GamePhase.NOT_INITIALIZED;
  uint public currentRoundStart = 1;
  uint public currentRoundBettingEnd = 1;
  // Find out how to use hashBetToOwner.size()
  uint curNumBets = 0;
  bytes32 public hashWinningNumber;
  address public owner;
  uint public revealedNumber = 0;
  uint8 betsClaimed = 0;
  int public closestDifference = 1000000;
  address[] public currentWinners;
  uint public currentWinnersCurrentSize = 0;
  // as we are not going to clear bets to spare gas we need to keep track if
  // each bet has been made in this iteration
  uint public bettingIteration = 1;
  uint constant maxUintValue = 2**256 - 1;

  mapping (bytes32 => BetSender) public hashBetToOwner;
  bytes32[] public listHashes;
  // We are not going to clear the list of hashes so we need the 'real' size
  uint public listHashesCurrentSize = 0;

  function Lottery() public {
    owner = msg.sender;
  }

  //function getListHashesCurrentSize() view returns (uint) {
  //  return listHashesCurrentSize;
  //}

  event NewBet (
    bytes32,
    address
  );

  event AnnounceWinner (
    int,
    address
  );

  /*function _uint2str(uint i) internal pure returns (string){
    if (i == 0) return "0";
    uint j = i;
    uint length;
    while (j != 0){
        length++;
        j /= 10;
    }
    bytes memory bstr = new bytes(length);
    uint k = length - 1;
    while (i != 0){
        bstr[k--] = byte(48 + i % 10);
        i /= 10;
    }
    return string(bstr);
}*/

 function _str2uint(bytes input) internal pure returns (uint){
    uint result = 0;

    uint index = input.length-1;
    uint multiplier = 1;
    while(index>=0 && input[index] != '.') {
        uint8 number;
        if(input[index] == '1') {
            number = 1;
        }else if(input[index] == '2') {
            number = 2;
        }
        else if(input[index] == '3') {
            number = 3;
        }
        else if(input[index] == '4') {
            number = 4;
        }
        else if(input[index] == '5') {
            number = 5;
        }
        else if(input[index] == '6') {
            number = 6;
        }
        else if(input[index] == '7') {
            number = 7;
        }
        else if(input[index] == '8') {
            number = 8;
        }
        else if(input[index] == '9') {
            number = 9;
        }
        else if(input[index] == '0') {
            number = 0;
        }

        result += number * multiplier;
        multiplier*=10;
        --index;
    }

    return result;
}

  function getAddressOwner(bytes32 hash) public view returns (address){
    return hashBetToOwner[hash].beneficiary;
  }

  function revealNumber(string _seedPlusNumber) public {
      require(msg.sender == owner);
      require(GamePhase.ACCEPTING_BETS == gamePhase);
      uint _revealedNumber = _str2uint(bytes(_seedPlusNumber));
      require(_revealedNumber > 0 && _revealedNumber <= 1000000);
      // Check if keccak256 can accept bytes32 as argument, if so do the conversion in JS to save gas
      bytes32 _hashWinningNumber = keccak256(_seedPlusNumber);
      require(hashWinningNumber == _hashWinningNumber);

      revealedNumber = _revealedNumber;
      gamePhase = GamePhase.WINNER_REVEALED;
  }

  function acceptBet(bytes32 _hashBet) public payable {
    require(GamePhase.ACCEPTING_BETS == gamePhase);
    require(msg.value == 1 ether);
    require(hashBetToOwner[_hashBet].iterationStamp < bettingIteration);
    require(currentRoundBettingEnd > block.timestamp);
    hashBetToOwner[_hashBet] = BetSender(msg.sender, bettingIteration);
    if(listHashesCurrentSize < listHashes.length) {
      // The array has already been expanded before
      listHashes[listHashesCurrentSize] = _hashBet;
    } else {
      listHashes.push(_hashBet);
    }
    ++listHashesCurrentSize;
    ++curNumBets;
    NewBet(_hashBet, msg.sender);
  }

  function claimBet(string _claimSeedPlusNumber) public {
      require(GamePhase.WINNER_REVEALED == gamePhase);
      uint _claimNumber = _str2uint(bytes(_claimSeedPlusNumber));
      require(_claimNumber > 0 && _claimNumber <= 1000000);
      bytes32 hashBet = keccak256(_claimSeedPlusNumber);
      BetSender refBetSender = hashBetToOwner[hashBet];
      require(refBetSender.beneficiary == msg.sender);
      require(refBetSender.iterationStamp == bettingIteration);
      // OK it is valid clear the mapping
      hashBetToOwner[hashBet].iterationStamp = 0;
      ++betsClaimed;

      int difference = int(_claimNumber - revealedNumber);
      if(difference < 0) {
        difference *= -1;
      }

      if(difference > closestDifference) {
        // Nothing to do, not close enough
        return;
      }
      if(difference < closestDifference) {
          // Better than all the previous, delete the previous
          closestDifference = difference;
          currentWinnersCurrentSize = 0;
          msg.sender;
      }
      // Either as good or better, we are adding this as winner
      if(currentWinnersCurrentSize < currentWinners.length) {
        currentWinners[currentWinnersCurrentSize] = msg.sender;
      } else {
        currentWinners.push(msg.sender);
      }
      ++currentWinnersCurrentSize;
  }

  function awardWinner() public {
    require(msg.sender == owner);
    require(GamePhase.WINNER_REVEALED == gamePhase);
    //AnnounceWinner(closestDifference, currentWinner);
    gamePhase = GamePhase.WINNER_CHOSEN;
    for(uint i=0; i<currentWinnersCurrentSize; ++i) {
        currentWinners[i].transfer(address(this).balance/currentWinnersCurrentSize);
    }
  }

  function reset(bytes32 _hashWinningNumber,
                  uint timeEndBetting) public {
      require(msg.sender == owner);
      currentRoundStart = block.timestamp;
      require(timeEndBetting > 0);
      currentRoundBettingEnd = currentRoundStart + timeEndBetting;
      // To be incremented with block.timestamp at the start of claiming

      gamePhase = GamePhase.ACCEPTING_BETS;
      curNumBets = 0;
      revealedNumber = 0;
      betsClaimed = 0;
      closestDifference = 1000000;
      hashWinningNumber = _hashWinningNumber;
      if(currentWinnersCurrentSize > 0){
        currentWinners[0] = owner;
      } else {
        currentWinners.push(owner);
      }
      currentWinnersCurrentSize = 1;
      // Handle the betting iteration overflow
      if(maxUintValue == bettingIteration) {
        bettingIteration = 1;
      } else {
        ++bettingIteration;
      }
      listHashesCurrentSize = 0;

  }



}
