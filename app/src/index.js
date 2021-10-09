import CO2Accounting from "../../build/contracts/CO2Accounting.json";
const mockUpKeys = {
  'admin': {
    account:'0xD0FB2327EC99AF3F7b2762D75DD6d4790Cfaca74',
    privateKey:'6c6c59e182a944cec36e45771bb265a034124be4ea1111d87a758e7ba0855947'
  },
  'mpo': {
    account:'0xd5Fe0C262cE3EEd5B2D3Be43ff4A0487f740114F',
    privateKey:'8568284ec638cfac009514967098a169fdb38bbf8051deaaa500bc2a37214085'
  },
  'compensator': {
    account:'0x6A85b9f1df53037B0824A2B957787fBBAf814Ac0',
    privateKey:'51f22e7436529d847434dda40e7fbe5a374ac7ed62b432ad3b6ff552241a380e'
  }
}

$(document).ready( async () => {

  const ethers = require("ethers");
  const Web3 = require("web3");

  const provider = new ethers.providers.Web3Provider(window.ethereum,"any")
  const signer = provider.getSigner();
  const chainId = 5777;
  let instance = {};

  try {
    const deployedNetwork = CO2Accounting.networks[chainId];
    instance = new ethers.Contract( deployedNetwork.address , CO2Accounting.abi , signer )
  } catch (error) {
    console.error("Could not connect to contract or chain.",error);
  }
  const walletEmitter = new ethers.Wallet(mockUpKeys.mpo.privateKey,provider);

  const renderStats = async function() {
    $('.dltBlockNumber').html(provider._lastBlockNumber);
    $('.dltConnection').html(provider.connection.url);
    $('.accountBalance').html(ethers.utils.formatUnits(await provider.getBalance(await signer.getAddress())));
    $('.mpoBalance').html(ethers.utils.formatUnits(await provider.getBalance(walletEmitter.address)));
    $('.accountTx').html(await provider.getTransactionCount(await signer.getAddress()));
    $('.mpoTx').html(await provider.getTransactionCount(walletEmitter.address));
    $('.accountCO2').html((await instance.balanceOf(await signer.getAddress())).toString());
  }

  const renderChargingEvent = function() {
    let energy = ((new Date().getTime() - chargingEvent.start)/3600000) * chargingEvent.power;
    $('.chargingStart').html(new Date(chargingEvent.start).toLocaleString());
    $('.chargingDuration').html(Math.round((new Date().getTime()-chargingEvent.start)/60000));
    $('.chargingPower').html(chargingEvent.power);
    $('.chargingEnergy').html(energy.toFixed(3));
  }

  const stopCharging = function() {
    $('#btnStopCharging').attr('disabled','disabled');
    $('.step1').removeClass("bg-primary").addClass("bg-dark");
    window.clearInterval(window.intervalCharging);
    let energy = ((new Date().getTime() - chargingEvent.start)/3600000) * chargingEvent.power;
    chargingEvent.stop = new Date().getTime();
    chargingEvent.energy = energy;
    $('.step2').removeClass("bg-dark").addClass("bg-primary");
    $.getJSON('https://api.corrently.io/v2.0/gsi/prediction?zip=69256',function(data) {
        let emissionFactor = data.forecast[0].co2_g_oekostrom;
        $('.eventEmissionFactor').html(emissionFactor);
        $('.eventEmission').html(Math.round(emissionFactor * chargingEvent.energy));
        chargingEvent.emission = Math.round(emissionFactor * chargingEvent.energy);
        $('#btnTxSubmit').removeAttr('disabled');
    });
  }

  const transmitTx = async function() {
    $('#btnTxSubmit').attr('disabled','disabled');
    console.log(await instance.connect(walletEmitter).emission(await signer.getAddress(),chargingEvent.emission));
    window.location.reload();
  }

  provider.on("network", (newNetwork, oldNetwork) => {
      if (oldNetwork) {
          window.location.reload();
      }
  });

  let chargingEvent = {
    'start': (new Date().getTime() - 3600000) - Math.round(Math.random() * 900000),
    'power': 10.500 + (Math.round(Math.random() * 1000)/1000),
    'energy': 0
  }

  window.intervalCharging = window.setInterval(renderChargingEvent,1000);
  window.intervalStats = window.setInterval(renderStats,1100);

  renderChargingEvent();
  renderStats();

  $('#btnTxSubmit').click(transmitTx);
  $('#btnStopCharging').click(stopCharging);
  $('.account').val(await signer.getAddress());

})
