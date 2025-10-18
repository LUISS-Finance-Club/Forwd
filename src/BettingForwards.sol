// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BettingForwards {
    
    // Structure for a forward position
    struct Forward {
        address owner;              // Who owns this position
        uint256 matchId;            // Which match (hardcoded for demo)
        uint256 lockedOdds;         // Odds when locked (e.g., 150 = +150)
        uint256 lockTime;           // When it was locked
        string encryptedDataRef;    // iExec encrypted stake amount
        bool isForSale;             // Listed on marketplace?
        uint256 premium;            // Price to buy this position
    }
    
    // Storage
    mapping(uint256 => Forward) public forwards;
    uint256 public forwardCount;
    
    // Events
    event ForwardLocked(uint256 indexed forwardId, address indexed owner, uint256 odds, uint256 matchId);
    event ForwardListed(uint256 indexed forwardId, uint256 premium);
    event ForwardSold(uint256 indexed forwardId, address indexed oldOwner, address indexed newOwner, uint256 premium);
    
    // Lock a new forward position
    function lockForward(
        uint256 _matchId,
        uint256 _odds,
        string memory _encryptedRef
    ) external payable {
        require(msg.value >= 0.0001 ether, "Need minimum lock fee");
        
        uint256 forwardId = forwardCount;
        
        forwards[forwardId] = Forward({
            owner: msg.sender,
            matchId: _matchId,
            lockedOdds: _odds,
            lockTime: block.timestamp,
            encryptedDataRef: _encryptedRef,
            isForSale: false,
            premium: 0
        });
        
        forwardCount++;
        
        emit ForwardLocked(forwardId, msg.sender, _odds, _matchId);
    }
    
    // List your forward for sale (backwards market)
    function listForSale(uint256 _forwardId, uint256 _premium) external {
        require(forwards[_forwardId].owner == msg.sender, "Not your forward");
        require(_premium > 0, "Premium must be > 0");
        
        forwards[_forwardId].isForSale = true;
        forwards[_forwardId].premium = _premium;
        
        emit ForwardListed(_forwardId, _premium);
    }
    
    // Buy someone's forward position
    function buyForward(uint256 _forwardId) external payable {
        Forward storage forward = forwards[_forwardId];
        
        require(forward.isForSale, "Not for sale");
        require(msg.value >= forward.premium, "Insufficient payment");
        
        address oldOwner = forward.owner;
        
        // Transfer premium to original owner
        payable(oldOwner).transfer(msg.value);
        
        // Transfer ownership
        forward.owner = msg.sender;
        forward.isForSale = false;
        forward.premium = 0;
        
        emit ForwardSold(_forwardId, oldOwner, msg.sender, msg.value);
    }
    
    // Get all forwards (for marketplace display)
    function getAllForwards() external view returns (Forward[] memory) {
        Forward[] memory allForwards = new Forward[](forwardCount);
        for (uint256 i = 0; i < forwardCount; i++) {
            allForwards[i] = forwards[i];
        }
        return allForwards;
    }
    
    // Get user's forwards
    function getMyForwards(address _user) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count user's forwards
        for (uint256 i = 0; i < forwardCount; i++) {
            if (forwards[i].owner == _user) {
                count++;
            }
        }
        
        // Create array of user's forward IDs
        uint256[] memory myForwardIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < forwardCount; i++) {
            if (forwards[i].owner == _user) {
                myForwardIds[index] = i;
                index++;
            }
        }
        
        return myForwardIds;
    }
}
