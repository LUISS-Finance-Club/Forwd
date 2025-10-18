// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title BettingForwardsV2
 * @notice Privacy-preserving sports betting forwards with REAL iExec integration
 * @dev Stores iExec DataProtector addresses instead of mock strings
 */
contract BettingForwardsV2 {
    
    struct Forward {
        address owner;
        uint256 matchId;
        uint256 lockedOdds;        // e.g., 3000 = 3.00x odds
        uint256 lockTime;
        address protectedDataAddress;  // ✅ REAL iExec protected data address
        bool isForSale;
        uint256 premium;           // Price to buy this forward
    }
    
    Forward[] public forwards;
    
    // Events
    event ForwardLocked(
        uint256 indexed forwardId,
        address indexed owner,
        uint256 matchId,
        uint256 odds,
        address protectedDataAddress  // ✅ Emit real address
    );
    
    event ForwardListed(
        uint256 indexed forwardId,
        address indexed owner,
        uint256 premium
    );
    
    event ForwardSold(
        uint256 indexed forwardId,
        address indexed oldOwner,
        address indexed newOwner,
        uint256 premium
    );
    
    /**
     * @notice Lock betting odds forward with encrypted stake
     * @param _matchId The sports match identifier
     * @param _odds The locked odds (scaled by 1000, e.g., 3000 = 3.00x)
     * @param _protectedDataAddress The iExec DataProtector contract address
     */
    function lockForward(
        uint256 _matchId,
        uint256 _odds,
        address _protectedDataAddress  // ✅ Accept address instead of string
    ) external payable {
        require(msg.value >= 0.0001 ether, "Minimum stake: 0.0001 ETH");
        require(_odds > 1000, "Odds must be > 1.0x");
        require(_protectedDataAddress != address(0), "Invalid protected data address");
        
        Forward memory newForward = Forward({
            owner: msg.sender,
            matchId: _matchId,
            lockedOdds: _odds,
            lockTime: block.timestamp,
            protectedDataAddress: _protectedDataAddress,  // ✅ Store real address
            isForSale: false,
            premium: 0
        });
        
        forwards.push(newForward);
        
        emit ForwardLocked(
            forwards.length - 1,
            msg.sender,
            _matchId,
            _odds,
            _protectedDataAddress  // ✅ Emit real address
        );
    }
    
    /**
     * @notice List forward for sale in marketplace
     * @param _forwardId The forward position ID
     * @param _premium Price in wei for someone to buy this forward
     */
    function listForSale(uint256 _forwardId, uint256 _premium) external {
        require(_forwardId < forwards.length, "Invalid forward ID");
        Forward storage forward = forwards[_forwardId];
        require(forward.owner == msg.sender, "Not owner");
        require(!forward.isForSale, "Already listed");
        
        forward.isForSale = true;
        forward.premium = _premium;
        
        emit ForwardListed(_forwardId, msg.sender, _premium);
    }
    
    /**
     * @notice Buy a forward from marketplace
     * @param _forwardId The forward to purchase
     */
    function buyForward(uint256 _forwardId) external payable {
        require(_forwardId < forwards.length, "Invalid forward ID");
        Forward storage forward = forwards[_forwardId];
        require(forward.isForSale, "Not for sale");
        require(msg.value >= forward.premium, "Insufficient payment");
        require(forward.owner != msg.sender, "Cannot buy own forward");
        
        address oldOwner = forward.owner;
        
        // Transfer ownership
        forward.owner = msg.sender;
        forward.isForSale = false;
        forward.premium = 0;
        
        // Pay seller
        payable(oldOwner).transfer(msg.value);
        
        emit ForwardSold(_forwardId, oldOwner, msg.sender, msg.value);
    }
    
    /**
     * @notice Get all forwards
     * @return Array of all forward positions
     */
    function getAllForwards() external view returns (Forward[] memory) {
        return forwards;
    }
    
    /**
     * @notice Get protected data address for a forward
     * @param _forwardId The forward ID
     * @return The iExec protected data address
     */
    function getProtectedDataAddress(uint256 _forwardId) 
        external 
        view 
        returns (address) 
    {
        require(_forwardId < forwards.length, "Invalid forward ID");
        return forwards[_forwardId].protectedDataAddress;
    }
    
    /**
     * @notice Check if caller owns a forward
     * @param _forwardId The forward ID
     * @return True if caller is owner
     */
    function isOwner(uint256 _forwardId) external view returns (bool) {
        require(_forwardId < forwards.length, "Invalid forward ID");
        return forwards[_forwardId].owner == msg.sender;
    }
}
