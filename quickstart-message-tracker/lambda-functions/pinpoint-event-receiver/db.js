const { Pool } = require('pg');

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PWD;
const database = process.env.DB_NAME;

const dbConfig = {
    host: host,
    port: port,
    user: user,
    password: password,
    database: database,
};

function chunk(array, size) {
    const chunkedArr = [];
    for (let i = 0; i < array.length; i++) {
      const last = chunkedArr[chunkedArr.length - 1];
      if (!last || last.length === size) {
        chunkedArr.push([array[i]]);
      } else {
        last.push(array[i]);
      }
    }
    return chunkedArr;
}

class DB {
    constructor() {
        const init = (async () => {
            this.pool = new Pool(dbConfig);
            this.connect = await this.pool.connect(); // Calling connect() is necessary.

            delete this.then;
            return this;
        })();

        this.then = init.then.bind(init);
    }

    releaseConnect() {
        this.connect.release();
    }

    async storeEmailEvents(events) {    
        const chunkEvents = chunk(events, 100);
    
        for (const i in chunkEvents) {
            const subEvents = chunkEvents[i]
            
            const sqlHead = `INSERT INTO "_message"."email_events" ("message_id", "event_type", "event")  
            VALUES `;
            if(subEvents.length > 0){
                const values = subEvents.map((event) => {
                    return `('${event.message_id}', '${event.event_type}', '${JSON.stringify(event)}')`;
                }).join(",");
                const sql = sqlHead + values + ";";
                await this.connect.query(sql);
            }
        }
    }
    
    async storeSmsEvents(events) {
        const chunkEvents = chunk(events, 100);
        
        for (const i in chunkEvents) {
            const subEvents = chunkEvents[i];
    
            const sqlHead = `INSERT INTO "_message"."sms_events" ("message_id", "event_type", "event")  
            VALUES `;            
            if(subEvents.length > 0){
                const values = subEvents.map((event) => {
                    return `('${event.message_id}', '${event.event_type}', '${JSON.stringify(event)}')`;
                }).join(",");
                const sql = sqlHead + values + ";";
                await this.connect.query(sql);
            }
        }
    }

}

module.exports = {
    DB: DB,
}