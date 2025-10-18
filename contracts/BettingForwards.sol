// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BettingForwards is ReentrancyGuard, Ownable {
    constructor() Ownable(msg.sender) {}
    struct Forward {
        uint256 id;
        string matchId;
        address owner;
        uint256 odds;
        string encryptedStakeRef;
        bool forSale;
        uint256 price;
        uint256 createdAt;
    }

    mapping(uint256 => Forward) public forwards;
    mapping(address => uint256[]) public userForwards;
    mapping(string => uint256[]) public matchForwards;
    
    uint256 public nextForwardId = 1;
    uint256 public platformFee = 250; // 2.5% in basis points
    
    event ForwardLocked(
        uint256 indexed forwardId,
        address indexed owner,
        string matchId,
        uint256 odds,
        string encryptedStakeRef
    );
    
    event ForwardListed(
        uint256 indexed forwardId,
        uint256 price
    );
    
    event ForwardBought(
        uint256 indexed forwardId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    function lockForward(
        string memory _matchId,
        uint256 _odds,
        string memory _encryptedStakeRef
    ) external returns (uint256) {
        require(_odds > 0, "Invalid odds");
        require(bytes(_matchId).length > 0, "Match ID required");
        require(bytes(_encryptedStakeRef).length > 0, "Encrypted stake reference required");
        
        uint256 forwardId = nextForwardId++;
        
        forwards[forwardId] = Forward({
            id: forwardId,
            matchId: _matchId,
            owner: msg.sender,
            odds: _odds,
            encryptedStakeRef: _encryptedStakeRef,
            forSale: false,
            price: 0,
            createdAt: block.timestamp
        });
        
        userForwards[msg.sender].push(forwardId);
        matchForwards[_matchId].push(forwardId);
        
        emit ForwardLocked(forwardId, msg.sender, _matchId, _odds, _encryptedStakeRef);
        
        return forwardId;
    }

    function listForSale(uint256 _forwardId, uint256 _price) external {
        require(forwards[_forwardId].owner == msg.sender, "Not the owner");
        require(_price > 0, "Price must be positive");
        require(!forwards[_forwardId].forSale, "Already listed for sale");
        
        forwards[_forwardId].forSale = true;
        forwards[_forwardId].price = _price;
        
        emit ForwardListed(_forwardId, _price);
    }

    function buyForward(uint256 _forwardId) external payable nonReentrant {
        Forward storage forward = forwards[_forwardId];
        require(forward.forSale, "Not for sale");
        require(msg.sender != forward.owner, "Cannot buy your own forward");
        require(msg.value >= forward.price, "Insufficient payment");
        
        address seller = forward.owner;
        uint256 price = forward.price;
        uint256 fee = (price * platformFee) / 10000;
        uint256 sellerAmount = price - fee;
        
        // Transfer ownership
        forward.owner = msg.sender;
        forward.forSale = false;
        forward.price = 0;
        
        // Update user forwards
        userForwards[msg.sender].push(_forwardId);
        
        // Transfer payment
        payable(seller).transfer(sellerAmount);
        if (fee > 0) {
            payable(address(this)).transfer(fee);
        }
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit ForwardBought(_forwardId, msg.sender, seller, price);
    }

    function getUserForwards(address _user) external view returns (uint256[] memory) {
        return userForwards[_user];
    }

    function getMatchForwards(string memory _matchId) external view returns (uint256[] memory) {
        return matchForwards[_matchId];
    }

    function getForwardsForSale() external view returns (uint256[] memory) {
        uint256[] memory saleForwards = new uint256[](nextForwardId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextForwardId; i++) {
            if (forwards[i].forSale) {
                saleForwards[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = saleForwards[i];
        }
        
        return result;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%");
        platformFee = _fee;
    }
}
