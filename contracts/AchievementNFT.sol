// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AchievementNFT (FITA)
 * @notice Soulbound achievement NFTs for FitTribe milestones.
 * @dev Tokens are non-transferable (soulbound) — they can only be minted and burned.
 *      Minting is exclusive to HabitRegistry.
 *      Each user can earn each achievement type only once.
 *
 *      Achievement types:
 *        0 = WEEK_WARRIOR    — 7 on-chain check-ins
 *        1 = IRON_CONSISTENT — 30 on-chain check-ins
 *        2 = CENTURY_CLUB    — 100 on-chain check-ins
 */
contract AchievementNFT is ERC721, Ownable {
    uint256 private _tokenIds;
    address public minter;

    uint8 public constant WEEK_WARRIOR    = 0;
    uint8 public constant IRON_CONSISTENT = 1;
    uint8 public constant CENTURY_CLUB    = 2;

    // user => achievementType => already earned
    mapping(address => mapping(uint8 => bool)) public hasAchievement;
    // tokenId => achievement type
    mapping(uint256 => uint8) public tokenAchievementType;

    // Base URIs per achievement (set by owner to point to IPFS JSON metadata)
    mapping(uint8 => string) public achievementURI;

    event AchievementMinted(address indexed user, uint8 indexed achievementType, uint256 tokenId);
    event MinterUpdated(address indexed oldMinter, address indexed newMinter);

    constructor() ERC721("FitTribe Achievement", "FITA") Ownable(msg.sender) {
        // Placeholder URIs — update via setAchievementURI after IPFS upload
        achievementURI[WEEK_WARRIOR]    = "ipfs://bafybeiweekwarrior";
        achievementURI[IRON_CONSISTENT] = "ipfs://bafybeiiron";
        achievementURI[CENTURY_CLUB]    = "ipfs://bafybeicentury";
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setMinter(address _minter) external onlyOwner {
        emit MinterUpdated(minter, _minter);
        minter = _minter;
    }

    function setAchievementURI(uint8 achievementType, string calldata uri) external onlyOwner {
        achievementURI[achievementType] = uri;
    }

    // ─── Minting ──────────────────────────────────────────────────────────────

    /**
     * @notice Mint an achievement NFT for a user.
     * @dev Only callable by the designated minter (HabitRegistry).
     *      Silently skips if the user already has this achievement.
     */
    function mintAchievement(address user, uint8 achievementType) external returns (uint256) {
        require(msg.sender == minter, "AchievementNFT: caller is not the minter");
        if (hasAchievement[user][achievementType]) return 0; // already earned — no revert, just skip

        _tokenIds++;
        uint256 tokenId = _tokenIds;
        _safeMint(user, tokenId);
        hasAchievement[user][achievementType] = true;
        tokenAchievementType[tokenId] = achievementType;

        emit AchievementMinted(user, achievementType, tokenId);
        return tokenId;
    }

    // ─── Soulbound enforcement ────────────────────────────────────────────────

    /**
     * @dev Override _update to block all transfers except mint (from == 0) and burn (to == 0).
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("AchievementNFT: soulbound - token is non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

    // ─── Metadata ─────────────────────────────────────────────────────────────

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return achievementURI[tokenAchievementType[tokenId]];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }
}
