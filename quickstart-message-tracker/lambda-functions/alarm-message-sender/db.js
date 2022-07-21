const { Pool } = require('pg');
const { Parser } = require('./parser.js');

const MESSAGE_TYPE_EMAIL = 'email';
const MESSAGE_TYPE_SMS = 'sms';

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

// Database schema
const schema_message = '_message';

// Database tables
const tbl_failed_sqs_messages  = 'failed_sqs_messages';


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

    // Store message received by Lambda from SQS
    async storeSqsMessage(event) {
        const message_id = Parser.parseMessageId_From_Sqs_Event(event);
        const message_body_str = event.body;
        const event_str = JSON.stringify(event);

        const sql = `INSERT INTO "_message"."failed_sqs_messages" ("type", "sqs_message_id", "message_body", "event") 
        VALUES ('${message_type}', '${message_id}', '${message_body_str}', '${event_str}');`;
        await this.pool.query(sql);
    }

}

module.exports = {
    DB: DB,
}