// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract HabitRegistry is Ownable {
    uint256 private _recordIds;

    struct HabitRecord {
        address user;
        string habitType;
        uint256 timestamp;
        string metadataUri;
    }

    mapping(uint256 => HabitRecord) public records;
    mapping(address => uint256[]) public userRecords;
    
    event HabitRecorded(uint256 indexed id, address indexed user, string habitType);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Internal function to handle the creation mapping of a record to a target user
     */
    function _createRecord(address userWallet, string memory habitType, string memory metadataUri) private {
        _recordIds++;
        uint256 id = _recordIds;
        records[id] = HabitRecord({
            user: userWallet,
            habitType: habitType,
            timestamp: block.timestamp,
            metadataUri: metadataUri
        });
        userRecords[userWallet].push(id);
        emit HabitRecorded(id, userWallet, habitType);
    }

    /**
     * @notice Approach 1: Frontend User Interaction (User pays gas)
     * @dev Record habit completion for the sender
     * @param habitType - type of habit
     * @param metadataUri - URI containing off-chain descriptive data
     */
    function recordHabit(string memory habitType, string memory metadataUri) public {
        _createRecord(msg.sender, habitType, metadataUri);
    }

    /**
     * @notice Approach 2: Backend Auto-Trigger (Server pays gas)
     * @dev Record habit completion for a specific target user. ONLY the owner/admin can call this.
     * @param targetUser - wallet address of the user who gets the streak recorded
     * @param habitType - type of habit
     * @param metadataUri - URI containing off-chain descriptive data
     */
    function adminRecordHabitForUser(address targetUser, string memory habitType, string memory metadataUri) public onlyOwner {
        _createRecord(targetUser, habitType, metadataUri);
    }

    function getUserRecordCount(address user) public view returns (uint256) {
        return userRecords[user].length;
    }

    function getUserRecords(address user) public view returns (uint256[] memory) {
        return userRecords[user];
    }

    function getRecord(uint256 id) public view returns (HabitRecord memory) {
        return records[id];
    }
}
