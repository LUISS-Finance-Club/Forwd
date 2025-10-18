// TESTNET CONTRACT (Base Sepolia - FREE!)
export const CONTRACT_ADDRESS = "0x8F8E55996eB7Eb8f12aF2b8668B70B8357bbC598";

export const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "lockForward",
    "inputs": [
      { "name": "_matchId", "type": "uint256" },
      { "name": "_odds", "type": "uint256" },
      { "name": "_encryptedRef", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getAllForwards",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          { "name": "owner", "type": "address" },
          { "name": "matchId", "type": "uint256" },
          { "name": "lockedOdds", "type": "uint256" },
          { "name": "lockTime", "type": "uint256" },
          { "name": "encryptedDataRef", "type": "string" },
          { "name": "isForSale", "type": "bool" },
          { "name": "premium", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "buyForward",
    "inputs": [{ "name": "_forwardId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "listForSale",
    "inputs": [
      { "name": "_forwardId", "type": "uint256" },
      { "name": "_premium", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "ForwardLocked",
    "inputs": [
      { "name": "forwardId", "type": "uint256", "indexed": true },
      { "name": "owner", "type": "address", "indexed": true },
      { "name": "odds", "type": "uint256" },
      { "name": "matchId", "type": "uint256" }
    ]
  },
  {
    "type": "event",
    "name": "ForwardListed",
    "inputs": [
      { "name": "forwardId", "type": "uint256", "indexed": true },
      { "name": "premium", "type": "uint256" }
    ]
  },
  {
    "type": "event",
    "name": "ForwardSold",
    "inputs": [
      { "name": "forwardId", "type": "uint256", "indexed": true },
      { "name": "oldOwner", "type": "address", "indexed": true },
      { "name": "newOwner", "type": "address", "indexed": true },
      { "name": "premium", "type": "uint256" }
    ]
  }
];
