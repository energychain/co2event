# co2event
CO2 Emission Event Accounting and Decompensation using DLT based Identity Management Concepts (ID-Ideal AP8).

[![CO2Offset](https://api.corrently.io/v2.0/ghgmanage/statusimg?host=co2event&svg=1)](https://co2offset.io/badge.html?host=co2event)



## Definitions
| Role      | Description |
| ----------- | ----------- |
| Emitter      | Something like a direct or indirect Metering device that might that knows that some Entity caused a certain CO2 emission |
| Entity   | Actual real world entity (human beeing?) that is responsible for the CO2 emission event. |
| Compensator | Some party/organization providing compensation of CO2 |

## Requirements
- NPM and Node JS (V12 or greater)
- Truffle Suite [Website](https://www.trufflesuite.com/)
- Ganache [Website](https://www.trufflesuite.com/ganache)

## Usage
Clone [GIT repository](https://github.com/energychain/co2event) and do basic dependency installation

```shell
git clone https://github.com/energychain/co2event.git
cd co2event
npm install
npm install -g truffle
npm run build
npm test
```

Do not forget to start/run Ganache :)

### Compiling Smart-Contracts
```shell
npm run build
```

### Interact with SmartContract (Deployed)
```shell
truffle console
let instance = await CO2Accounting.deployed();
instance.totalSupply();
```

### Test Smart Contract
```shell
npm test
```
![grafik](https://user-images.githubusercontent.com/37406473/136347539-03eb09f6-2620-4de7-a29c-4e25561c20ac.png)

## Usecase EV-Charging (GER)

![123456 drawio](https://user-images.githubusercontent.com/37406473/136455105-b984ba25-2624-4aa8-8e9a-5fed4fc09eeb.png)


0. **Deployment des Smart Contracts und Rollenzuweisung der Teilnehmer über Wallet Adressen**
- Messstellenbetreiber -> Emitter (Recht Burnable Token auf fremden Adressen zu emitieren)
- Nutzer/Person -> Entity
- Plant for the Planet -> Compensator (Recht Burnable Token auf fremden Adressen zu vernichten)

1. **Nutzer führt E-Auto Beladung über 5 kWh durch**
- Emitter 'emittiert' das CO2 Äquivalent der 5 kWh Beladung von 175g in die Wallet der Entity als Burnable Token

2. **Nutzer will die Beladung Kompensieren**
- Prüfvorgang ob Kompensation möglich ist

3. **Planet for the Planet kompensiert für Nutzer**
- Compensator vernichtet die 175 Burnable Token der Entity

### DApp

Prepare your environement

`Start Ganache` and select Quickstart
![Ganache Start Screen](./docs/ganache_start.png)

```shell
npm run migrate
```

Validate Results:
```
Summary
=======
> Total deployments:   2
> Final cost:          0.05141418 ETH
```

Switch in Ganache to Transactions panel:
![Ganache Transactions Screen](./docs/ganache_post_migration.png)

Finally start Development HTTP Server:
`cd app && npm run dev`
