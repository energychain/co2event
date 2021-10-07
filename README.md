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
npm test
```
![grafik](https://user-images.githubusercontent.com/37406473/136347539-03eb09f6-2620-4de7-a29c-4e25561c20ac.png)

## Usecase EV-Charging (GER)

![prozess](https://user-images.githubusercontent.com/37406473/136359247-6451e318-6708-418c-b706-7b4ad0c82c98.png)


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