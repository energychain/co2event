import CO2Accounting from "../../build/contracts/CO2Accounting.json";
import CO2CertRegistry from "../../build/contracts/CO2CertRegistry.json";

const ethereumButton = document.querySelector('.enableEthereumButton');

ethereumButton.addEventListener('click', () => {
  //Will Start the metamask extension
  ethereum.request({ method: 'eth_requestAccounts' });
});


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

const renderHTMLEvents = function(events,totalName) {
    let html = '<table class="table">'
    html += '<tr>';
    html += '<th>Block Number</th>';
    html += '<th class="text-end">CO<sub>2</sub>eq (g)</th>';
    html += '</tr>';
    let total=0;
    for(let i=0;i<events.length;i++) {
      html += '<tr>';
      html += '<td>' + events[i].blockNumber + '</td>';
      html += '<td class="text-end">' + events[i].args[1].toString() + '</td>';
      html += '</tr>';
      total += 1 * events[i].args[1].toString();
    }
    html += '<tr><td><strong>Total '+totalName+'</strong></td><td class="text-end">'+total+"</td></tr>";
    html += '</table>';

    return {html:html,sum:total};
}

const parseMustache = function (str, obj) {
  return str.replace(/{{\s*([\w\.]+)\s*}}/g, function(tag, match) {
    var nodes = match.split("."),
      current = obj,
      length = nodes.length,
      i = 0;
    while (i < length) {
      try {
        current = current[nodes[i]];
      } catch (e) {
        return "";
      }
      i++;
    }
    return current;
  });
}

const dapp = async function() {
  const ethers = require("ethers");
  const Web3 = require("web3");

  const provider = new ethers.providers.Web3Provider(window.ethereum,"any")
  const signer = provider.getSigner();
  let chainId = 5777;
  if(typeof window.ethereum !== 'undefined') {
    chainId = parseInt(window.ethereum.chainId, 16);
  }
  if(isNaN(chainId)) chainId = 5777;
  if(chainId == 1337) chainId= 5777;
  let instance = {};
  let certRegistry = {};
  window.chainId = chainId;

  try {
    console.log('Welcome to CO2Accounting based on DLT!');
    console.log('---------------------------------------');
    console.log('chainId',chainId);
    const deployedNetwork = CO2Accounting.networks[chainId];
    console.log('Deployment CO2Accounting',deployedNetwork.address);
    instance = new ethers.Contract( deployedNetwork.address , CO2Accounting.abi , signer )
    const deployedNetworkRegistry = CO2CertRegistry.networks[chainId];
    console.log('Deployment CO2CertRegistry',deployedNetworkRegistry.address);
    certRegistry = new ethers.Contract( deployedNetworkRegistry.address , CO2CertRegistry.abi , signer )

    /** Setup Event Listening **/
    provider.on('block',function(data) {
      $('.blocknumber').html(data);
    })

    const filterMyEmissions = instance.filters.Emission(await signer.getAddress());
    let liabilities = await instance.queryFilter(filterMyEmissions);

    const statsLiabilities = renderHTMLEvents(liabilities,'Liabilities');
    $('.tblLiabilities').html(statsLiabilities.html);
    //  await signer.getAddress()
    const filterMyCompensation = instance.filters.Compensation(await signer.getAddress());
    let assets = await instance.queryFilter(filterMyCompensation);
    const statsAssets = renderHTMLEvents(assets,'Assets');
    $('.tblAssets').html(statsAssets.html);

    const filterCertificates = certRegistry.filters.ExternalCertificate();
    let certificates = await certRegistry.queryFilter(filterCertificates);
    let html = '';
    for(let i=0;i<certificates.length;i++) {
      let remainingCo2 = ['-'];
      if(certificates[i].args !== null) {
       remainingCo2 = await certRegistry.certificates(certificates[i].args[0]);

        html += '<li>';
        html += '<button type="button" class="btn btn-sm btn-primary useCertificate" data-remain="'+remainingCo2[0].toString()+'" data="'+certificates[i].args[0].toString()+'">'+certificates[i].args[0].toString() + '<span class="badge bg-success">'+remainingCo2[0]+'/'+certificates[i].args[1].toString()+'g</span></button>';
        html += '</li>';
      } else {
        console.log('Missing certificate in UI',certificates[i]);
      }
    }
    $('.certificatesList').html(html);
    $('.useCertificate').click(function(e) {
        $('#compensateCertificate').val($(this).attr('data'));
        $('#compensateCO2eq').val($(this).attr('data-remain'));
        $('.useCertificate').attr('disabled','disabled');
        $('#btnBuyCertificate').attr('disabled','disabled');
        $('.stepCompensate1').removeClass("bg-primary").addClass("bg-dark");
        $('#btnTxCompensateSubmit').removeAttr('disabled');
        $('.stepCompensate2').removeClass("bg-dark").addClass("bg-primary");
    });

  } catch (error) {
    console.error("Could not connect to contract or chain.",error);
  }

  // Wallet Setup
  const walletEmitter = new ethers.Wallet(mockUpKeys.mpo.privateKey,provider);
  const walletCompensator = new ethers.Wallet(mockUpKeys.compensator.privateKey,provider);

  const buyGSCertificate = async function() {
    return new Promise(async function (resolve, reject) {
      const settings = {
      	"async": true,
      	"crossDomain": true,
      	"url": "https://co2-offset.p.rapidapi.com/rapidapi/compensate?gram="+$('#rapidCO2').val(),
      	"method": "GET",
      	"headers": {
      		"x-rapidapi-host": "co2-offset.p.rapidapi.com",
      		"x-rapidapi-key": $('#rapidAPI').val()
      	}
      };
      window.localStorage.setItem("rapid-api-key",$('#rapidAPI').val());

      await $.ajax(settings).done(function (response) {
        resolve(response);
      });
    });
  };

  const renderStats = async function() {
    let totalSupply = -1;
    let totalCertified = -1;
    let totalEmission = -1;
    let totalCompensation = -1;

    if(typeof instance.balanceOf !== 'undefined') {
      $('.dltBlockNumber').html(provider._lastBlockNumber);
      $('.dltConnection').html(provider.connection.url);
      $('.accountBalance').html(ethers.utils.formatUnits(await provider.getBalance(await signer.getAddress())));
      $('.mpoBalance').html(ethers.utils.formatUnits(await provider.getBalance(walletEmitter.address)));
      $('.accountTx').html(await provider.getTransactionCount(await signer.getAddress()));
      $('.mpoTx').html(await provider.getTransactionCount(walletEmitter.address));
      $('.accountCO2').html((await instance.balanceOf(await signer.getAddress())).toString());
      totalSupply = (await instance.totalSupply()).toString() * 1;
      totalCertified = (await certRegistry.totalCertified()).toString() * 1;
      totalEmission =  (await instance.totalEmission()).toString() * 1;
      totalCompensation =  (await instance.totalCompensation()).toString() * 1;
    }
    if(location.pathname.indexOf("consensus.html")>-1) {
        await $.ajax({
          url:"./img/consensus_frame.svg",
          type:'GET',
          dataType:'text'
          }).done(function(response) {
            response = response.substr(response.indexOf("<svg"));
            window.datasvg = response;
        });
        if(typeof window.datasvg !== 'undefined') {
          let data = {
            EMISSION:totalEmission,
            FLOATING:totalSupply.toString(),
            ACQUIRED:totalCertified.toString(),
            COMPENSATED:totalCompensation.toString(),
            BLOCK:provider._lastBlockNumber
          };
          $('#consensusSVG').html(parseMustache(window.datasvg,data));
        }
        let html = '<table class="table table-condensed">'
        html += '<tr>';
        html += '<th>Certificate</th>';
        html += '<th class="text-end">Certified</th>';
        html += '<th class="text-end">Remaining</th>';
        html += '</tr>';
        const filterCertificates = certRegistry.filters.ExternalCertificate();
        let certificates = await certRegistry.queryFilter(filterCertificates);
        for(let i=0;i<certificates.length;i++) {
          if(certificates[i].args !== null) {
          let cert = await certRegistry.certificates(certificates[i].args[0]);
            html += '<tr>';
            html += '<td><button type="button" data="' + certificates[i].args[0] + '" class="btn btn-sm btn-light btn-details">' + certificates[i].args[0] + '</button></td>';
            html += '<td class="text-end">' + certificates[i].args[1].toString() + '</td>';
            html += '<td class="text-end">' + cert[0].toString() + '</td>';
            html += '</tr>';
          }
        }
        html += '</table>';
        $('.extConsensus').html(html);
        $('.btn-details').unbind();
        $('.btn-details').click(function() {
          let certificate = $(this).attr('data');
          $.getJSON("https://api.corrently.io/v2.0/co2/certificate?compensation="+certificate,function(data) {
            $('#rowDetails').show();
            let html = '<table class="table table-condensed table-striped" style="margin-bottom:35px">';
            html += '<tr><td><strong>Verified Carbon Standard Certificate (VCS)</strong></td><td class="text-end">'+data.certificate.tree+'</td></tr>';
            html += '<tr><td>&nbsp;&nbsp;Location (Meta)</td><td class="text-end">'+data.certificate.meta+'</td></tr>';
            html += '<tr><td>&nbsp;&nbsp;Partner</td><td class="text-end">'+data.certificate.issuer+'</td></tr>';
            html += '<tr><td>&nbsp;&nbsp;Actual CO<sub>2</sub> in Transaction</td><td class="text-end">'+data.co2+'</td></tr>';
            html += '<tr><td><strong>Gold Standard Credit Certificate (GSC)</strong></td><td class="text-end">'+data.gsc.tx.from+'</td></tr>';
            html += '<tr><td>&nbsp;&nbsp;Type Note</td><td class="text-end">'+data.gsc.note+'</td></tr>';
            html += '<tr><td>&nbsp;&nbsp;Actual CO<sub>2</sub> in Transaction</td><td class="text-end">'+data.gsc.tx.co2+'</td></tr>';
            html += '</table><h4>Gold Standard Registry Data</h4><div id="gsregdata"></div>';
            $('.detailsConsensus').html(html);
            $('#detailsID').html(certificate);
            $.getJSON("https://api.corrently.io/v2.0/co2/identity?account="+data.gsc.tx.from,function(dataID) {
                $.getJSON("https://api.corrently.io/v2.0/co2/goldstandard/credits?query="+dataID.serial_number,function(dataGS) {
                    if(Array.isArray(dataGS)) dataGS = dataGS[0];

                    let html2 = '<table class="table table-condensed table-striped" style="margin-bottom:35px">';
                    html2 += '<tr><td><strong>Serial Number</strong></td><td class="text-end">'+dataID.serial_number+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Created At</td><td class="text-end">'+dataGS.created_at+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Updated At</td><td class="text-end">'+dataGS.updated_at+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Number of Credits (tones)</td><td class="text-end">'+dataGS.number_of_credits+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Starting Credit Number</td><td class="text-end">'+dataGS.starting_credit_number+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Ending Credit Number</td><td class="text-end">'+dataGS.ending_credit_number+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Batch Number</td><td class="text-end">'+dataGS.batch_number+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Certified Date</td><td class="text-end">'+dataGS.certified_date+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Start Monitored Period</td><td class="text-end">'+dataGS.monitoring_period_start_date+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;End Monitored Period</td><td class="text-end">'+dataGS.monitoring_period_end_date+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Vintage</td><td class="text-end">'+dataGS.vintage+'</td></tr>';
                    html2 += '<tr><td><strong>Project</strong></td><td class="text-end">'+dataGS.project.id+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Name</td><td class="text-end"><a href="'+dataGS.project.sustaincert_url+'" target="_blank">'+dataGS.project.name+'</a></td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Created At</td><td class="text-end">'+dataGS.project.created_at+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Description</td><td class="text-end">'+dataGS.project.description+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Methodology</td><td class="text-end">'+dataGS.project.methodology+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Type</td><td class="text-end">'+dataGS.project.type+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Country</td><td class="text-end">'+dataGS.project.country+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Carbon Stream</td><td class="text-end">'+dataGS.project.carbon_stream+'</td></tr>';
                    html2 += '<tr><td>&nbsp;&nbsp;Programme</td><td class="text-end">'+dataGS.project.programme_of_activities+'</td></tr>';
                    html2 += '</table>'
                    $('#gsregdata').html(html2);
                });
            });
          });
        });

    }
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

  const buyCertificate = async function() {
    $('#btnBuyCertificate').attr('disabled','disabled');
    $('.stepCompensate1').removeClass("bg-primary").addClass("bg-dark");
    const buyResult = await buyGSCertificate();
    const certificate = buyResult.certificate;
    console.log(certRegistry);
    console.log(await certRegistry.connect(walletCompensator).addCertificate(certificate.compensation,certificate.co2requested));
    $('#compensateCertificate').val(certificate.compensation);
    $('#compensateCO2eq').val(certificate.co2requested);
    $('#btnTxCompensateSubmit').removeAttr('disabled');
    $('.stepCompensate2').removeClass("bg-dark").addClass("bg-primary");
    window.location.reload();
  }

  const compensateUser = async function() {
      $('#btnTxCompensateSubmit').attr('disabled','disabled');
      console.log(await certRegistry.connect(walletCompensator).compensate(instance.address,$('#compensateCertificate').val(),$('#compensateFor').val(),$('#compensateCO2eq').val()));
      $('#btnTxCompensateSubmit').removeAttr('disabled');
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
  $('#btnBuyCertificate').click(buyCertificate);
  $('#btnStopCharging').click(stopCharging);
  $('#btnTxCompensateSubmit').click(compensateUser);
  try {
      $('.account').val(await signer.getAddress());
      $('.onEthereum').show();
      $('.enableEthereumButton').hide();
  } catch(e) {
    $('.onEthereum').hide();
    $('.enableEthereumButton').show();
  }
  if(window.localStorage.getItem("rapid-api-key") !== null) {
    $('#rapidAPI').val(window.localStorage.getItem("rapid-api-key"));
  }
}
$(document).ready( async () => {
  setInterval(function() {
    if(typeof window.ethereum !== 'undefined') {
        if(window.chainId !== window.ethereum.chainId) {
          console.log('Starting on '+window.ethereum.chainId);
          dapp();
          window.chainId = window.ethereum.chainId;
        }
    }
  },1000);
  // dapp();
})
