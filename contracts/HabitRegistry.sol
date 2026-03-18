
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";

contract HabitRegistry is Ownable {
    uint256 private  _recordIds;

    struct HabitRecord {
        address user;
        string habitType;
        uint256 timestamp;
        string metadataUri;
    }

    mapping(uint256 => HabitRecord) public records;
    mapping(address => uint256[]) public userRecords;
    
    event  HabitRecorded(uint256 indexed id, address indexed user, string habitType);
    constructor() Ownable(msg.sender) {}

    function recordHabit(string memory habitType, string memory metadataUri)
    public {
            _recordIds++;
            uint256 id = _recordIds;
            records[id] = HabitRecord({
                user: msg.sender,
                habitType: habitType,
                timestamp: block.timestamp,
                metadataUri: metadataUri
            });
        userRecords[msg.sender].push(id);
        emit HabitRecorded(id, msg.sender, habitType);
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
