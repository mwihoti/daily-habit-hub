// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./HabitToken.sol";
import "./AchievementNFT.sol";

/**
 * @title HabitRegistry v2
 * @notice Core registry for FitTribe on-chain habit records.
 *
 * Features:
 *   - Dual recording: user self-records (Approach 1) or admin records for user (Approach 2)
 *   - Rate limit: one record per wallet per calendar day (UTC)
 *   - Reward: 10 $HABIT tokens minted per valid check-in
 *   - Milestones: achievement NFTs minted at 7, 30, 100 on-chain records
 *   - Pausable: owner can pause all recording in emergencies
 */
contract HabitRegistry is Ownable, Pausable {
    // ─── State ────────────────────────────────────────────────────────────────

    uint256 private _recordIds;

    HabitToken   public habitToken;
    AchievementNFT public achievementNFT;

    /// @dev 10 HABIT tokens per valid check-in
    uint256 public constant DAILY_REWARD = 10 * 10 ** 18;

    struct HabitRecord {
        address user;
        string  habitType;
        uint256 timestamp;
        string  metadataUri;
    }

    mapping(uint256 => HabitRecord)    public records;
    mapping(address => uint256[])      public userRecords;
    /// @dev Stores the UTC day number of the user's last record (block.timestamp / 1 days)
    mapping(address => uint256)        public lastRecordDay;

    // ─── Events ───────────────────────────────────────────────────────────────

    event HabitRecorded(uint256 indexed id, address indexed user, string habitType);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _habitToken, address _achievementNFT) Ownable(msg.sender) {
        habitToken   = HabitToken(_habitToken);
        achievementNFT = AchievementNFT(_achievementNFT);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _createRecord(
        address userWallet,
        string memory habitType,
        string memory metadataUri
    ) private {
        _recordIds++;
        uint256 id = _recordIds;

        records[id] = HabitRecord({
            user:        userWallet,
            habitType:   habitType,
            timestamp:   block.timestamp,
            metadataUri: metadataUri
        });
        userRecords[userWallet].push(id);
        lastRecordDay[userWallet] = block.timestamp / 1 days;

        emit HabitRecorded(id, userWallet, habitType);

        // Mint $HABIT reward — graceful failure (if token paused or cap reached, don't revert)
        try habitToken.mint(userWallet, DAILY_REWARD) {} catch {}

        // Achievement milestones based on total on-chain records
        uint256 total = userRecords[userWallet].length;
        if (total == 7)   { try achievementNFT.mintAchievement(userWallet, 0) {} catch {} }
        if (total == 30)  { try achievementNFT.mintAchievement(userWallet, 1) {} catch {} }
        if (total == 100) { try achievementNFT.mintAchievement(userWallet, 2) {} catch {} }
    }

    // ─── Public Recording ─────────────────────────────────────────────────────

    /**
     * @notice Approach 1: User records their own habit. User pays gas.
     * @dev Reverts if the caller has already recorded today.
     */
    function recordHabit(
        string memory habitType,
        string memory metadataUri
    ) external whenNotPaused {
        require(
            lastRecordDay[msg.sender] < block.timestamp / 1 days,
            "HabitRegistry: already recorded today"
        );
        _createRecord(msg.sender, habitType, metadataUri);
    }

    /**
     * @notice Approach 2: Admin records on behalf of a user. Admin pays gas.
     * @dev Only callable by the contract owner (server wallet behind a Gnosis Safe in production).
     */
    function adminRecordHabitForUser(
        address targetUser,
        string memory habitType,
        string memory metadataUri
    ) external onlyOwner whenNotPaused {
        require(
            lastRecordDay[targetUser] < block.timestamp / 1 days,
            "HabitRegistry: already recorded today for this user"
        );
        _createRecord(targetUser, habitType, metadataUri);
    }

    // ─── Emergency Controls ───────────────────────────────────────────────────

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ─── View Functions ───────────────────────────────────────────────────────

    function getUserRecordCount(address user) external view returns (uint256) {
        return userRecords[user].length;
    }

    /// @dev WARNING: unbounded array — use pagination for large record sets
    function getUserRecords(address user) external view returns (uint256[] memory) {
        return userRecords[user];
    }

    /// @dev Paginated version to avoid gas issues for users with many records
    function getUserRecordsPaginated(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory) {
        uint256[] storage all = userRecords[user];
        uint256 length = all.length;
        if (offset >= length) return new uint256[](0);
        uint256 end = offset + limit > length ? length : offset + limit;
        uint256[] memory page = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = all[i];
        }
        return page;
    }

    function getRecord(uint256 id) external view returns (HabitRecord memory) {
        return records[id];
    }

    /// @notice Returns true if the user has not yet recorded today
    function canRecordToday(address user) external view returns (bool) {
        return lastRecordDay[user] < block.timestamp / 1 days;
    }
}
