# co2event
CO2 Emission Event Accounting and Decompensation using DLT based Identity Management Concepts (ID-Ideal AP8).

## Definitions
| Role      | Description |
| ----------- | ----------- |
| Emitter      | Something like a direct or indirect Metering device that might that knows that some Entity caused a certain CO2 emission |
| Entity   | Actual real world entity (human beeing?) that is responsible for the CO2 emission event. |
| Compensator | Some party/organization providing compensation of CO2 |

## Requirements
- NPM and Node JS (V12 or greater)

## Usage
Clone [GIT repository](https://github.com/energychain/co2event) and do basic dependency installation

```shell
git clone https://github.com/energychain/co2event.git
cd co2event
npm install
```

### Compiling Smart-Contracts
```shell
npm run build
```

### Test Smart Contract
```shell
npx hardhat test ./smartcontracts/test/co2accounting.test.js
```
