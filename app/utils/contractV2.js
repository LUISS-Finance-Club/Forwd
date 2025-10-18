// V2 CONTRACT - With real iExec address support
export const CONTRACT_ADDRESS_V2 = "0x202880fD62048Fbd7c70c6bEb4583a88357B2218";

export const CONTRACT_ABI_V2 = [
  {
    "type": "function",
    "name": "lockForward",
    "inputs": [
      { "name": "_matchId", "type": "uint256" },
      { "name": "_odds", "type": "uint256" },
      { "name": "_protectedDataAddress", "type": "address" }
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
          { "name": "protectedDataAddress", "type": "address" },
          { "name": "isForSale", "type": "bool" },
          { "name": "premium", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getProtectedDataAddress",
    "inputs": [{ "name": "_forwardId", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isOwner",
    "inputs": [{ "name": "_forwardId", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "bool" }],
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
  }
];
