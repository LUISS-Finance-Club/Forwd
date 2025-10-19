// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BettingForwardsV3 {
    struct Forward {
        uint256 matchId;
        uint256 lockedOdds;
        address protectedDataAddress;
        address owner;
        bool isForSale;
        uint256 premium;
    }

    struct BettingOption {
        uint256 matchId;
        uint256 strikeOdds;
        uint256 optionPremium;
        address holder;
        bool exercised;
        bool expired;
        uint256 expiry;
    }

    Forward[] public forwards;
    BettingOption[] public options;

    event ForwardLocked(uint256 indexed forwardId, address indexed owner, uint256 lockedOdds);
    event ForwardListed(uint256 indexed forwardId, uint256 premium);
    event ForwardSold(uint256 indexed forwardId, address indexed from, address indexed to);
    event OptionBought(uint256 indexed optionId, address indexed holder, uint256 strikeOdds);
    event OptionExercised(uint256 indexed optionId, uint256 forwardId);

    function lockForward(
        uint256 _matchId,
        uint256 _lockedOdds,
        address _protectedDataAddress
    ) external payable {
        forwards.push(Forward({
            matchId: _matchId,
            lockedOdds: _lockedOdds,
            protectedDataAddress: _protectedDataAddress,
            owner: msg.sender,
            isForSale: false,
            premium: 0
        }));
        emit ForwardLocked(forwards.length - 1, msg.sender, _lockedOdds);
    }

    function buyOption(
        uint256 _matchId,
        uint256 _strikeOdds,
        uint256 _expiryTimestamp
    ) external payable {
        require(msg.value > 0, "Must pay premium for option");
        options.push(BettingOption({
            matchId: _matchId,
            strikeOdds: _strikeOdds,
            optionPremium: msg.value,
            holder: msg.sender,
            exercised: false,
            expired: false,
            expiry: _expiryTimestamp
        }));
        emit OptionBought(options.length - 1, msg.sender, _strikeOdds);
    }

    function exerciseOption(
        uint256 _optionId,
        address _protectedDataAddress
    ) external payable {
        BettingOption storage option = options[_optionId];
        require(option.holder == msg.sender, "Not your option");
        require(!option.exercised, "Already exercised");
        require(!option.expired, "Option expired");
        require(block.timestamp <= option.expiry, "Past expiry time");
        option.exercised = true;
        forwards.push(Forward({
            matchId: option.matchId,
            lockedOdds: option.strikeOdds,
            protectedDataAddress: _protectedDataAddress,
            owner: msg.sender,
            isForSale: false,
            premium: 0
        }));
        emit OptionExercised(_optionId, forwards.length - 1);
    }

    function expireOption(uint256 _optionId) external {
        BettingOption storage option = options[_optionId];
        require(option.holder == msg.sender, "Not your option");
        require(!option.exercised, "Already exercised");
        require(block.timestamp > option.expiry, "Not yet expired");
        option.expired = true;
    }

    function listForSale(uint256 _forwardId, uint256 _premium) external {
        require(_forwardId < forwards.length, "Invalid forward ID");
        Forward storage forward = forwards[_forwardId];
        require(forward.owner == msg.sender, "Not the owner");
        require(!forward.isForSale, "Already listed");
        forward.isForSale = true;
        forward.premium = _premium;
        emit ForwardListed(_forwardId, _premium);
    }

    function buyForward(uint256 _forwardId) external payable {
        require(_forwardId < forwards.length, "Invalid forward ID");
        Forward storage forward = forwards[_forwardId];
        require(forward.isForSale, "Not for sale");
        require(msg.value >= forward.premium, "Insufficient payment");
        address previousOwner = forward.owner;
        forward.owner = msg.sender;
        forward.isForSale = false;
        forward.premium = 0;
        payable(previousOwner).transfer(msg.value);
        emit ForwardSold(_forwardId, previousOwner, msg.sender);
    }

    function cancelSale(uint256 _forwardId) external {
        require(_forwardId < forwards.length, "Invalid forward ID");
        Forward storage forward = forwards[_forwardId];
        require(forward.owner == msg.sender, "Not the owner");
        require(forward.isForSale, "Not listed for sale");
        forward.isForSale = false;
        forward.premium = 0;
    }

    function getAllForwards() external view returns (Forward[] memory) {
        return forwards;
    }

    function getAllOptions() external view returns (BettingOption[] memory) {
        return options;
    }

    function getForward(uint256 _forwardId) external view returns (Forward memory) {
        require(_forwardId < forwards.length, "Invalid forward ID");
        return forwards[_forwardId];
    }

    // ✅ FIXED: Returns single option, not array
    function getOption(uint256 _optionId) external view returns (BettingOption memory) {
        require(_optionId < options.length, "Invalid option ID");
        return options[_optionId];
    }
}
