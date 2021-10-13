// SPDX-License-Identifier: MIT
// contracts/CO2Presaging.sol
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CO2Presafing is AccessControl, ERC20 {
    bytes32 public constant EMITTER_ROLE = keccak256("EMITTER_ROLE");
    uint256 public totalEmission = 0;
    event Emission(address indexed to,uint256 presafing,address upstreamda);
    address[] public disaggregations;

    constructor() ERC20("CO2 Presafing", "CO2-") {    
      _setupRole(EMITTER_ROLE,msg.sender);
    }

    function mint(address to, uint256 presafing,address upstreamda) public onlyRole(EMITTER_ROLE) {
        _mint(to, presafing);
        disaggregations.push(upstreamda);
        totalEmission += presafing;
        emit Emission(to, presafing,upstreamda);

    }
}
