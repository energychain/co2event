// contracts/CO2CertRegistry.sol
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CO2Accounting.sol";

contract CO2CertRegistry is AccessControl {

   event ExternalCertificate(address externalcertificate,uint co2eq);
   event Compensation(CO2Accounting co2event,address certificate,address entity,uint co2eq);

   struct Spares {
        uint256 co2eq;
        address entity;
   }

   struct Certificate {
        uint co2eq;
        address externalId;
        Spares[] spares;
    }

    address public owner;
    mapping(address => Certificate) public certificates;

    constructor() {
        owner = msg.sender;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addCertificate(address certificate,uint co2eq) public onlyRole(DEFAULT_ADMIN_ROLE) virtual returns (bool) {
        certificates[certificate].co2eq = co2eq;
        certificates[certificate].externalId = certificate;
        // certificates[certificate].spares = [];
        emit ExternalCertificate(certificate,co2eq);
        return true;
    }


     function compensate(CO2Accounting co2event,address certificate,address entity,uint co2eq) public onlyRole(DEFAULT_ADMIN_ROLE) virtual returns (bool) {
         if( certificates[certificate].co2eq < co2eq ) revert();
         certificates[certificate].co2eq -= co2eq;
         certificates[certificate].spares.push(Spares({
                co2eq: co2eq,
                entity: entity
         }));
         co2event.compensation(entity,co2eq);
         emit Compensation(co2event,certificate,entity,co2eq);
     }
}
