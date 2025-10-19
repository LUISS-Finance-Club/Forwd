export const CONTRACT_ADDRESS_V3 = "0xF63FaCBDbD5E2568782b7A27FDf1A62369c2AB33";

export const CONTRACT_ABI_V3 = [
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "forwardId", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "lockedOdds", "type": "uint256"}],
    "name": "ForwardLocked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "forwardId", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "premium", "type": "uint256"}],
    "name": "ForwardListed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "forwardId", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {"indexed": true, "internalType": "address", "name": "to", "type": "address"}],
    "name": "ForwardSold",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "optionId", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "holder", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "strikeOdds", "type": "uint256"}],
    "name": "OptionBought",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "uint256", "name": "optionId", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "forwardId", "type": "uint256"}],
    "name": "OptionExercised",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_matchId", "type": "uint256"}, {"internalType": "uint256", "name": "_strikeOdds", "type": "uint256"}, {"internalType": "uint256", "name": "_expiryTimestamp", "type": "uint256"}],
    "name": "buyOption",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_forwardId", "type": "uint256"}],
    "name": "buyForward",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_forwardId", "type": "uint256"}],
    "name": "cancelSale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_optionId", "type": "uint256"}, {"internalType": "address", "name": "_protectedDataAddress", "type": "address"}],
    "name": "exerciseOption",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_optionId", "type": "uint256"}],
    "name": "expireOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllForwards",
    "outputs": [{"components": [{"internalType": "uint256", "name": "matchId", "type": "uint256"}, {"internalType": "uint256", "name": "lockedOdds", "type": "uint256"}, {"internalType": "address", "name": "protectedDataAddress", "type": "address"}, {"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "bool", "name": "isForSale", "type": "bool"}, {"internalType": "uint256", "name": "premium", "type": "uint256"}], "internalType": "struct BettingForwardsV3.Forward[]", "name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllOptions",
    "outputs": [{"components": [{"internalType": "uint256", "name": "matchId", "type": "uint256"}, {"internalType": "uint256", "name": "strikeOdds", "type": "uint256"}, {"internalType": "uint256", "name": "optionPremium", "type": "uint256"}, {"internalType": "address", "name": "holder", "type": "address"}, {"internalType": "bool", "name": "exercised", "type": "bool"}, {"internalType": "bool", "name": "expired", "type": "bool"}, {"internalType": "uint256", "name": "expiry", "type": "uint256"}], "internalType": "struct BettingForwardsV3.BettingOption[]", "name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_matchId", "type": "uint256"}, {"internalType": "uint256", "name": "_lockedOdds", "type": "uint256"}, {"internalType": "address", "name": "_protectedDataAddress", "type": "address"}],
    "name": "lockForward",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_forwardId", "type": "uint256"}, {"internalType": "uint256", "name": "_premium", "type": "uint256"}],
    "name": "listForSale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
