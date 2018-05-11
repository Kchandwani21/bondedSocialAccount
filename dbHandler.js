const Database = require('sqlite-async')//.verbose()

class dbHandler{

    constructor(){
            this.table = [
                'create table accounts(',
                'id integer primary key autoincrement,',
                'userid integer not null default 0,',
                'username text not null,',
                'dot_balance integer not null default 0,',
                'banned integer not null default 0,',
                'last_update integer not null default 0,',
                'created integer not null default 0,',
                'address text not null default "0x0"',
                ')'
            ].join('\n');
        }

        async openTable(file ='./db/accounts.db' ){
           if(this.db){
            
           }else{
               this.db = await Database.open(file);
               console.log(this.db);
           }
        }        

        async createTable(){
            return await this.db.exec(this.table);
        }

        async dropTable(){
            return await this.db.exec('drop table accounts');
        }

        async emptyAccounts(){
            return await this.db.run('delete from accounts');
        }

        async newAccount(username, userid){
            let rows = await this.db.all("select * from accounts where username=?", username);
console.log(rows);
            if(rows.length > 0){
                console.log('already exists')
                return -1;
            } 

            let t = Math.floor(Date.now() / 1000);
            let stmt = await this.db.prepare("insert into accounts(username,userid,created) values(?,?,?)");
            stmt.run(username,userid, t);
            return 1;
        }

        async verify(username, address){
            console.log(username, address);
            let stmt = await this.db.prepare("update accounts set address = ? where username = ?");
            stmt.run(address, username);
        }       

        async getBalance(username){
            let row = await this.db.get('select dot_balance from accounts where username = ?', username); 
            return row;
        }        

        async updateBalance(username, dotBalance){

            let t = Math.floor(Date.now() / 1000);
            console.log(username, dotBalance);
            let stmt = await this.db.prepare("update accounts set dot_balance = ?, last_update = ? where username = ?");
            stmt.run(dotBalance, t, username)
        }        

        async markBanned(username){
            let stmt = await this.db.prepare("update accounts set banned = 1 where username = ?");
            stmt.run(username)
        }

        async markNotBanned(username){
            let stmt = await this.db.prepare("update accounts set banned = 0 where username = ?");
            stmt.run(username)
        }

        async getAccounts(){
            let rows = await this.db.all("select * from accounts where address != '0x0'");
            return rows;
        }


        async getBanned(){
            let rows = await this.db.all("select * from accounts where banned = 1");
            return rows;
        }

        async getNotBanned(){
            let rows = await this.db.all("select * from accounts where banned = 0");
            return rows;
        }

        async getDelinquent(threshold = 1){

            let t = Math.floor(Date.now()/1000);

            let rows = await this.db.all("select * from accounts where dot_balance = 0 and (last_update + ?) < ?", threshold, t);
            return rows;
        }

        async getStaked(threshold = 10000){

            let t = Math.floor(Date.now()/1000);
            let rows = await this.db.all("select * from accounts where dot_balance > 0");
            // let rows = await this.db.all("select * from accounts where dot_balance > -1 or ( dot_balance = 0 and (last_update + ?) > ? )", threshold, t);
            return rows;
        }
}

async function main(){
    let t = new dbHandler();

    await t.openTable();
    // await t.dropTable();
    // await t.createTable();
    // await t.emptyAccounts();

    let user = 'spacevikiing';
    let userid = 411256960;

    // await t.newAccount(user, userid);

    // await t.verify(user,'0x0');

    // let bal =  await t.getBalance(user);
    // console.log(bal);
    //
    await t.updateBalance(user,10);
    bal =  await t.getBalance(user);
    console.log(bal);
    //
    // await t.markBanned(user);
    // let banned = await t.getBanned();
    // console.log(banned);
    //
    // await t.markNotBanned(user);
    // banned = await t.getBanned();
    // console.log(banned);
    //
    // let del = await t.getDelinquent();
    // console.log(del);
    //
    // let staked = await t.getStaked();
    // console.log(staked);
}
    
    
// main();

module.exports = dbHandler;
