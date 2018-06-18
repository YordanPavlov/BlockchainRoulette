
# Ethereum Blockchain Roulette

A roulette game based on the Ethereum blockchain.

## Prerequisites

The game presumes you are using a web3 provider, I tested it with the Metamask plugin. It has no other backend besides the blockchain.

## Design decisions

### Randomness

A main decision which had to be made, was how to provide the randomness needed to pick the winning number. I decided on using the hash number of a future block, although this is not a secure solution. Still I did not want to introduce an Oracle.

### Gameplay

To complete a full game, the player sends two transactions on the blockchain. The first one would register a bet in the contract. The second one should be made in two blocks time (around a minute) and it is used to check for any profit and also transfer it.

### Known flows

The contract can be used by multiple players at once. However the calculation if a player's bet is
payable by the contract is done in the web3 frontend. This is vulnerable to a race condition between
multiple players.


## Disclaimer

This code is written as an exercise and proof of concept. It is not to be used for betting with real money in no way.
