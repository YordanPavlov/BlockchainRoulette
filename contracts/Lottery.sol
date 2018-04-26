pragma solidity ^0.4.19;


contract Lottery {

  struct BetSender {
      address beneficiary;
      uint iterationStamp;
  }

  // 0 - accepting bets
  // 1 - revealed winning number, bets are not accepted only claims
  uint8 gamePhase = 0;
  uint8 maxNumBets = 10;
  // Find out how to use hashBetToOwner.size()
  uint curNumBets = 0;
  bytes32 hashWinningNumber;
  address public owner;
  uint winningNumber = 0;
  uint8 betsClaimed = 0;
  int closestDifference = 1000000;
  address currentWinner;
  // as we are not going to clear bets to spare gas we need to keep track if
  // each bet has been made in this iteration
  uint bettingIteration;

  mapping (bytes32 => BetSender) public hashBetToOwner;
  bytes32[] public listHashes;
  // We are not going to clear the list of hashes so we need the 'real' size
  uint public listHashesCurrentSize = 0;

  function Lottery() public {
    owner = msg.sender;
    currentWinner = owner;
    bettingIteration = 1;
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
        --index;
    }

    return result;
}

  function revealWinningNumber(string _seedPlusNumber) public {
      require(msg.sender == owner);
      require(0 == gamePhase);
      uint _winningNumber = _str2uint(bytes(_seedPlusNumber));
      require(_winningNumber > 0 && _winningNumber <= 1000000);
      bytes32 _hashWinningNumber = keccak256(_seedPlusNumber);
      require(hashWinningNumber == _hashWinningNumber);

      winningNumber = _winningNumber;
      gamePhase = 1;
  }

  function acceptBet(bytes32 _hashBet) public payable {
    require(0 == gamePhase);
    require(msg.value == 1 ether);
    require(hashBetToOwner[_hashBet].iterationStamp < bettingIteration);
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
      require(1 == gamePhase);
      uint _claimNumber = _str2uint(bytes(_claimSeedPlusNumber));
      require(_claimNumber > 0 && _claimNumber <= 1000000);
      bytes32 hashBet = keccak256(_claimSeedPlusNumber);
      BetSender refBetSender = hashBetToOwner[hashBet];
      require(refBetSender.beneficiary == msg.sender);
      require(refBetSender.iterationStamp == bettingIteration);
      // OK it is valid clear the mapping
      hashBetToOwner[hashBet].iterationStamp = 0;
      ++betsClaimed;

      int difference = int(_claimNumber - winningNumber);
      if(difference < 0) {
        difference *= -1;
      }

      if(difference < closestDifference) {
          closestDifference = difference;
          currentWinner = msg.sender;
      }
  }

  function reset(bytes32 _hashWinningNumber) public {
      require(msg.sender == owner);
      if(gamePhase > 0) {
        AnnounceWinner(closestDifference, currentWinner);
        currentWinner.transfer(address(this).balance);
      }
      gamePhase = 0;
      curNumBets = 0;
      winningNumber = 0;
      betsClaimed = 0;
      closestDifference = 1000000;
      hashWinningNumber = _hashWinningNumber;
      currentWinner = owner;
      ++bettingIteration;
      listHashesCurrentSize = 0;
  }



}
