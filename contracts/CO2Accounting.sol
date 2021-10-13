// SPDX-License-Identifier: MIT
// contracts/co2accounting.sol
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CO2Presafing.sol";

/**
 * Implements CO2 Event handling (Emission event => Compensation) with the pattern of a burnable token.
 */

contract CO2Accounting is AccessControl, ERC20 {
    bytes32 public constant EMITTER_ROLE = keccak256("EMITTER_ROLE");
    bytes32 public constant COMPENSATOR_ROLE = keccak256("COMPENSATOR_ROLE");
    uint256 public totalEmission = 0;
    uint256 public totalCompensation = 0;
    CO2Presafing public presafings = new CO2Presafing();

    event Emission(address indexed to, uint256 amount,address upstreamda,uint256 presafing);
    event Compensation(address indexed from, uint256 amount,address certificate);
    event Congestion(address indexed recipient, uint256 amount);

    address[] public disaggregations;

    constructor() ERC20("CO2G", "CO2G") {
      _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
      _setupRole(EMITTER_ROLE,msg.sender);
      _setupRole(COMPENSATOR_ROLE,msg.sender);
    }

    function emission(address to, uint256 amount,address upstreamda,uint256 presafing) public onlyRole(EMITTER_ROLE) {
        _mint(to, amount);
        totalEmission += amount;
        disaggregations.push(upstreamda);
        presafings.mint(to,presafing,upstreamda);
        emit Emission(to, amount,upstreamda,presafing);
    }

    function compensation(address from, uint256 amount,address certificate) public onlyRole(COMPENSATOR_ROLE) {
        _burn(from, amount);
        totalCompensation += amount;
        emit Compensation(from,amount,certificate);
    }

    function transfer(address recipient, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) virtual override returns (bool) {
      _transfer(_msgSender(), recipient, amount);
      emit Congestion(recipient, amount);
      return true;
    }

    function decimals() public view override returns (uint8) {
        return 0;
    }
}
