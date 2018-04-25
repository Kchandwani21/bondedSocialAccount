const Eth = new require('ethjs');
const { fromAscii,toBN } = require('ethjs');
const BigNumber = require('bignumber.js');

const eth = new Eth(new Eth.HttpProvider('http://127.0.0.1:9545'));
const networkId = 'development';

const ZapBondage = require('./api/contracts/ZapBondage');
const BondageABI = require('./build/contracts/BondageInterface.json').abi; 
const BondageAddress = require('./build/contracts/Bondage.json').networks[networkId].address;

const wrapperParams = { 'eth':eth, 'contract_address':BondageAddress, 'abiFile':BondageABI };
const bondage = new ZapBondage(wrapperParams);

const endpoint = fromAscii("telegram");

setInterval(function(){

    // update user dot balances by address from table 
//for each record

    //fix wrapper so contract method needn't be called directly
    bondage.contract.getDots(userAddress, providerAddress,endpoint).then(res=>{
    
        //upadte record 
    });

},60000);
