pragma solidity ^0.4.19;


contract Lottery {

  enum Position {
      zero, one, two, three, four, five, six, seven, eight, nine, ten,
      eleven, twelve, thirteen, fourteen, fifthteen, sixteen, nineteen, twenty,
      twentyone, twentytwo, twentythree, twentyfour, twentyfive, twentysix, twentyseven, twentyeight, twenty nine,
      thirty, thirtyone, thirtytwo, thirtythree, thirtyfour, thirtyfive, thirtysix
  }

  struct Bet {
      Position position;
      uint value;
  }

  struct BetsUser {
    uint placementTime = 0; // height of blockchain at the time of placement
    Bet[49] bets;
    uint8 betsLength = 0;
  }

  mapping (address => BetsUser) betsPerUser;
  mapping (address => uint) depositPerUser;
  bytes32[] public listHashes;
  // We are not going to clear the list of hashes so we need the 'real' size
  //uint public listHashesCurrentSize = 0;

  function Lottery() public {
    owner = msg.sender;
  }

  function getAddressOwner(bytes32 hash) public view returns (address){
    return hashBetToOwner[hash].beneficiary;
  }

  function placeBet(uint8 position) public {
      require(0 == betsPerUser[msg.sender].placementTime);
      require(position <= 49);
      require(msg.value <= 1 ether);
      Bet newBet = new Bet();
      newBet.position = position;
      newBet.value = msg.value;
      betsPerUser[msg.sender].bets[position] = newBet;
  }

  function finalizeBets() public {
      require(0 == betsPerUser[msg.sender].placementTime);
      betsPerUser[msg.sender].placementTime = block.number;
  }

  function clearBetsNoClaim() public {
    betsPerUser[msg.sender].placementTime = 0;
    betsPerUser[msg.sender].betsLength = 0;
  }

  function claimBet() public {
    require(betsPerUser[msg.sender].placementTime > 0);
    require(betsPerUser[msg.sender].placementTime <= block.number - 2);
    /* Make sure the hash is still visible
     *
     * "You can only access the hashes of the most recent 256 blocks, all other values will be zero."
     */
    uint blockHashRandomness = blockhash(betsPerUser[msg.sender].placementTime + 2);
    require(blockHashRandomness > 0);

    uint8 chosenNumber = blockHashRandomness % 37;

    //TODO
  }

  function deposit() public payable {
    depositPerUser[msg.sender] += msg.value;
  }




}
