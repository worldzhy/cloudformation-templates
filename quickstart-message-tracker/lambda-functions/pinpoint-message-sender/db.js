const { Pool } = require('pg');
const { Parser } = require('./parser.js');

// One lambda function handles only one type messages.
const message_type = process.env.MESSAGE_TYPE;
const MESSAGE_TYPE_EMAIL = 'email';
const MESSAGE_TYPE_SMS = 'sms';

const shooter_level = process.env.SHOOTER_LEVEL;

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
const tbl_received_sqs_messages  = 'received_sqs_messages';
const tbl_sent_pinpoint_messages = 'sent_pinpoint_messages';



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

    begin() { this.connect.query('BEGIN'); }
    commit() { this.connect.query('COMMIT'); }
    rollback() { this.connect.query('ROLLBACK'); }
    release() { this.connect.release(); }

    // Store message received by Lambda from SQS
    async storeSqsMessage(sqs_message) {
        const sqs_message_id = Parser.parseMessageId_From_Sqs_Event(sqs_message);
        const message_body_str = sqs_message.body;
        const sqs_message_str = JSON.stringify(sqs_message);

        const sql = `INSERT INTO "_message"."received_sqs_messages" ("type", "level", "sqs_message_id", "message_body", "event") 
        VALUES ('${message_type}', '${shooter_level}', '${sqs_message_id}', '${message_body_str}', '${sqs_message_str}');`;
        await this.pool.query(sql);
    }

    // Store message sent by Pinpoint
    async storePinpointMessage(request_params, response, sqs_message) {
        const response_obj = Parser.parse_Pinpoint_Response(response);
        const response_data = response_obj.response_data;
        const response_err = response_obj.response_err;

        const request_params_str = JSON.stringify(request_params);
        
        if (response_data) {
            const sqs_message_id = Parser.parseMessageId_From_Sqs_Event(sqs_message);

            let pinpoint_message_id = '';
            let delivery_status = '';
            if (message_type == MESSAGE_TYPE_EMAIL) {
                const response_results = Parser.parse_Pinpoint_Email_Messages_Response_Results(response_data);
                if (response_results.length > 0) {
                    pinpoint_message_id = response_results[0].message_id;
                    delivery_status = response_results[0].delivery_status;
                }
            } else if (message_type == MESSAGE_TYPE_SMS) {
                /* const response_results = Parser.parse_Pinpoint_Email_Messages_Response_Results(response_data);
                if (response_results.length > 0) {
                    message_id = response_results[0].message_id;
                } */
            } else {}
            

            const sql = `INSERT INTO "_message"."sent_pinpoint_messages" ("type", "level", "request_params", "response_data", "pinpoint_message_id", "delivery_status", "sqs_message_id") 
                    VALUES ('${message_type}', '${shooter_level}', '${request_params_str}', '${JSON.stringify(response_data)}', '${pinpoint_message_id}', '${delivery_status}', '${sqs_message_id}');`;
            await this.pool.query(sql);

        } else if (response_err) {
            const sql = `INSERT INTO "_message"."sent_pinpoint_messages" ("type", "level", "request_params", "response_err") 
                    VALUES ('${message_type}', '${shooter_level}', '${request_params_str}', '${JSON.stringify(response_err)}');`;
            await this.pool.query(sql);
        } else {}
    }

}

module.exports = {
    DB: DB,
}