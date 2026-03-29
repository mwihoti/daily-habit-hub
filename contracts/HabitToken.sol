// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HabitToken ($HABIT)
 * @notice ERC20 reward token for FitTribe. Minted exclusively by HabitRegistry.
 * @dev 21,000,000 HABIT cap (mirrors Bitcoin scarcity narrative).
 *      Only the designated minter (HabitRegistry contract) can mint.
 *      Owner can update the minter address (e.g., when registry is upgraded).
 */
contract HabitToken is ERC20Capped, Ownable {
    address public minter;

    event MinterUpdated(address indexed oldMinter, address indexed newMinter);

    constructor() ERC20("Habit Token", "HABIT") ERC20Capped(21_000_000 * 10 ** 18) Ownable(msg.sender) {}

    /**
     * @notice Set the address allowed to mint tokens (should be HabitRegistry).
     */
    function setMinter(address _minter) external onlyOwner {
        emit MinterUpdated(minter, _minter);
        minter = _minter;
    }

    /**
     * @notice Mint tokens to a user. Only callable by the minter.
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "HabitToken: caller is not the minter");
        _mint(to, amount);
    }
}
