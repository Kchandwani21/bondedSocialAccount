const ethereumJsUtil = require('ethereumjs-util');
const TelegramBot = require('node-telegram-bot-api');
const dbHandler = require('./dbHandler.js');
const config = require('./config.json');

class BondageMod{

    constructor(botToken, chatId, dbHandler, pollPeriod){
        this.bot = new TelegramBot(botToken, {polling: true})
        this.chatId = chatId;
        this.pollPeriod = pollPeriod;
        this.db = dbHandler;
        this.verifyMessage = 'test';
        this.lastMsgId;
        this.incoming();
        this.pollAccounts();    
    }

    //save member to database
    newMembers(msg){
        for(let i=0;i<msg.new_chat_members.length;i++){

            this.bot.sendMessage(chatId, 'welcome to the group. be sure to post your signature asap');
            this.db.newAccount(msg.new_chat_members[i].username, msg.new_chat_members[i].id);
        }
    }

    //listen for incoming messages
    incoming(){

        //new member
        this.bot.on('message', (msg) => {
            
            // console.log(msg);
            if(msg.hasOwnProperty('chat') && msg.chat.id == chatId){
                if(msg.hasOwnProperty('new_chat_members')){
                    if(msg.message_id != this.lastMsgId){

                        console.log(msg);
                        this.lastMsgId = msg.message_id;
                        this.newMembers(msg); 
                    }
                }
            }
        }); 

        //posted text
        this.bot.onText(/(.+)/, (msg, match) => {
            
            // console.log(msg);
            if(msg.hasOwnProperty('chat') && msg.chat.id == chatId){
                let resp = match[1]; 
                if(resp.substring(0,2) == '0x'){
                    
                    console.log(resp, msg.from.username);
                    this.verifySignature(resp, msg.from.username);
                }
                else{
                    this.chat(msg.text);
                } 
            }
        });
    }

    //poll database for user dot balance updates. ban/unban accordingly
    async pollAccounts(counter=0){

        // console.log(counter, Date.now());
        setTimeout(async () => {
            //unban banned users who have refilled their zap 
            let staked  = await this.db.getStaked();
            for(let i=0;i<staked.length;i++){
                if(staked[i].banned == 1){

                    console.log(staked[i], 'unban');

                    await this.bot.unbanChatMember(this.chatId, staked[i].userid).then( async (r) =>{
                        
                        await this.db.markNotBanned(staked[i].username);

                    });
                }
            }

            //ban users who have generated dots for free period
            let unstaked = await this.db.getDelinquent();
            for(let i=0; i< unstaked.length; i++){
                
                console.log(unstaked[i], 'ban');

                await this.bot.kickChatMember(this.chatId, unstaked[i].userid).then( async (r)=>{

                    this.db.markBanned(unstaked[i].username);
                });
            }
            counter+=1;
            this.pollAccounts(counter);

        },this.pollPeriod);
    }

    verifySignature(hex, username){
        let addr = this.recoverAddress(hex);
        if(addr != "0x0"){
            this.db.verify(username, addr); 
        }
    }

    //recover user ethereum address from signature supplied from browser, 
    //web3.personal.sign(web3.fromUtf8(msg),web3.eth.coinbase,console.log)
    recoverAddress(hex){

        try{
            let signatureBuffer=ethereumJsUtil.toBuffer(hex);
            let msgBuffer = ethereumJsUtil.toBuffer(this.verifyMessage);
            let msgHash=ethereumJsUtil.hashPersonalMessage(msgBuffer);
            let signatureParams=ethereumJsUtil.fromRpcSig(signatureBuffer);
            let publicKey=ethereumJsUtil.ecrecover(msgHash,signatureParams.v,signatureParams.r,signatureParams.s);
            let addressBuffer=ethereumJsUtil.publicToAddress(publicKey);
            return ethereumJsUtil.bufferToHex(addressBuffer);
        }
        catch(e){
            console.log(e);
            return "0x0";
        }
    }

    //evaluate text
    chat(text){
        //whatever
    }
    
    //post message to group
    postText(text){
        this.bot.sendMessage(chatId, text);
    }

}

async function main(){

    let db = await new dbHandler();
    await db.openTable();

    let bot = await new BondageMod(config.botToken,config.chatId,db);

}

main();
