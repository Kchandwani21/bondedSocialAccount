const config = require('./config.json');
const dbHandler = require('./dbHandler.js');
const db = new dbHandler();

const Eth = new require('ethjs');
const { fromAscii,toBN } = require('ethjs');
const BigNumber = require('bignumber.js');

const eth = new Eth(new Eth.HttpProvider(config.provider));

const ZapBondage = require('./api/contracts/ZapBondage');
const BondageABI = require('./build/contracts/Bondage.json').abi; 
const BondageAddress = require('./build/contracts/Bondage.json').networks[config.networkId].address;

const wrapperParams = { 'eth':eth, 'contract_address':BondageAddress, 'abiFile':BondageABI };
const bondage = new ZapBondage(wrapperParams);

const endpoint = fromAscii(config.endpoint);


async function poll(){
    
    // update user dot balances by address from table 
    await db.openTable();
    setTimeout(async function(){

        //for each record
        let accounts = await db.getAccounts();
        for(let i=0;i<accounts.length;i++){
            //fix wrapper so contract method needn't be called directly
            console.log(accounts[i]);

            bondage.contract.getBoundDots(accounts[i].address, config.accountAddress, endpoint).then(res=>{
                let newBalance = res[0].toNumber();
                let balance = parseInt(accounts[i].dot_balance);

                if(balance != newBalance ){

                    //update record 
                    db.updateBalance(accounts[i].username, newBalance);
                }
            });
        }

        poll();

    }, config.periodPollContract);
}


eth.accounts().then(accounts => {

poll();

})


