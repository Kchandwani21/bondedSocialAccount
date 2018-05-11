services for 'bonded telegram group' 
group member must bond to provider account within grace period specified from config.json
to remain in group.  

    npm install
    node telegram_worker.js
    node account_worker.js

the following is dummy data for config.json

//telegram api this.bot token. can be genereated via chat with @BotFather telegram bot 

    "botToken":"5190443543253463:AAE7RiA0dUktREm831zay0",

//get chatId for group https://stackoverflow.com/questions/32423837/telegram-this.bot-how-to-get-a-group-chat-id

    "chatId":-1001271542360,

//accout to bond to. must exist with bonding curve in registry contract

    "accountAddress":"0xea7ed4a6bdc64d0e74d5acd5f0a752bb692c3401",

//endpoint specifier from registry account

    "endpoint":"test-linear-specifier",

//ethereum params

    "networkId":"development",
    "provider":"http://127.0.0.1:9545",

//worker polling intervals

    "periodPollContract":1000,
    "periodPollDatabase":1000,
    "periodGrace":10000
