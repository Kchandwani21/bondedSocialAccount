const TelegramBot = require('node-telegram-bot-api');
const ethereumJsUtil = require('ethereum-js-util');

//required- see telegram bot api for token details
const botToken = ''; //telegram api bot token from @BotFather telegram bot
const chatId = '';//get chatId for group https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id


//TODO integrate DB
class BondageMod{

    let bot,chatID;
    let unbanPeriod=600000;

    constructor(botToken, chatId){
        this.bot = new TelegramBot(botToken, {polling: true})
        this.chatId = chatId;
        this.incoming();
        this.pollAccounts();    
    }

    //evaluate text
    chat(text){
        //whatever
    }
    
    //post message to group
    postText(text){
        this.bot.sendMessage(chatId, text);
    }

    //save member to database
    newMembers(msg){
        for(let i=0;i<msg.new_chat_members.length;i++){
            bot.sendMessage(chatId, 'welcome to the group. be sure to post your signature asap');
            //add if not in db
        }
    }

    //listen for incoming messages
    incoming(){

        //new member
        bot.on('message', (msg) => {
        if(msg.hasOwnProperty('chat') && msg.chat.id == chatId){
            if(msg.hasOwnProperty('new_chat_members')){
                this.newMembers(msg); 
            }
        } 

        //posted text
        bot.onText(/(.+)/, (msg, match) => {
            if(msg.hasOwnProperty('chat') && msg.chat.id == chatId){
                let resp = match[1]; 
                if(resp.substring(0,2) == '0x'){
                    verifySignature(resp);
                }
                else{
                    this.chat(msg.text);
                } 
            }
        }
    }

    //poll database for user dot balance updates. ban/unban accordingly
    pollAccounts(){

        this.runLoop = setInterval(function(){

            //unban banned users who have refilled their zap 
            let toAdd = refilledUsers();  
            for(let i=0;i<users.length;i++){
                bot.unbanChatMember(chatId, toAdd[i].id);
            });

            //ban users who have generated dots for free period
            let toBan = delinquentUsers();
            for(i=0;i<toBan.length;i++){

                let user = getUserDots(msg.new_chat_members[i].id);
                if(user.dots > 0){

                    bot.sendMessage(chatId, 'come back with your signature after you\'ve staked some ZAP....');
                    setTimeout(function(){
                        bot.kickChatMember(chatId, user.id);
                    },5000);
                } 
            }
        },unbanPeriod);
    }

    //recover user ethereum address from signature supplied from browser, 
    //web3.personal.sign(web3.fromUtf8(msg),web3.eth.coinbase,console.log)
    recoverAddress(hex){

        let signatureBuffer=ethereumJsUtil.toBuffer(hex),
        try{
            signatureParams=ethereumJsUtil.fromRpcSig(signatureBuffer),
            publicKey=ethereumJsUtil.ecrecover(msgHash,signatureParams.v,signatureParams.r,signatureParams.s),
            addressBuffer=ethereumJsUtil.publicToAddress(publicKey),
            return ethereumJsUtil.bufferToHex(addressBuffer)
        }
        catch(e){
            return "0x0";
        }
    }
   
    //return users who have elapsed freePeriod with 0 dot balance 
    delinquentUsers(user){
        let users;
        //select * from users where dots=0 and banned=0 and currentTime - initiatedTime > freePeriod
        return users; 
    }

    //return banned users who now have > 0 dot balance
    refilledUsers(){
        let users;
        //select * from users where dots > 0 and banned = 1
        return users;
    }
}


