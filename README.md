# CBT / CBLK

A token aggregation protocol similar to an index allowing any set of ERC20s to be pooled and a token representative of proportional ownership minted. When the ownership token (CBLK) is burned, underlying assets (CBTs or other tokens) are distributed pro-rata to the burner.

## Usage
`npm i` - install all required node packages

`npx hardhat run scripts/deploy.js` - deploys the contract with a treasury address set in the script, prints deployed address when finished

`npx hardhat test` - run all unit tests 
