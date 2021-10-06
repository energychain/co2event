// contracts/MyContract.sol
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/**
 * Implements CO2 Event handling (Emission event => Compensation) with the pattern of a burnable token.
 */

contract CO2Accounting is AccessControl, ERC20 {
    bytes32 public constant EMITTER_ROLE = keccak256("EMITTER_ROLE");
    bytes32 public constant COMPENSATOR_ROLE = keccak256("COMPENSATOR_ROLE");

    constructor() ERC20("CO2A", "CO2A") {
      _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function emission(address to, uint256 amount) public onlyRole(EMITTER_ROLE) {
        _mint(to, amount);
    }

    function compensation(address from, uint256 amount) public onlyRole(COMPENSATOR_ROLE) {
        _burn(from, amount);
    }

    function transfer(address recipient, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) virtual override returns (bool) {
      _transfer(_msgSender(), recipient, amount);
      return true;
    }
}
