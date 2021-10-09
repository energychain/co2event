# DApp Use Cases

## UC1: Settlement

![Step1](./docs/uc_settlement_1.drawio.png)

Entity (User) ends a charging session (by pressing the Stop button). MPO (Meter Point Operator) has final consumption and is able to retrieve the latest CO2 emission factor.

![Step1](./docs/uc_1_settlement_1.png)  

Using CO2 emission factor for this session the settled CO2 will be transfered by calling the `emission` method of the [CO2Accounting Contract](../contracts/CO2Accounting.sol). This transaction needs to be signed by a pre approved `EMITTER_ROLE`.

In the DApp this transaction is issued using the `Transmit Transaction` button.
![Step2](./docs/uc_1_settlement_2.png)  

After the transaction is commited the **Consensus / Ledger** Information should contain the right emitted CO2eq for the user.
