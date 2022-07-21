const { Pinpoint } =  require("./pinpoint.js");
const { DB } = require("./db.js");

const alarm_to_email_address = process.env.ALARM_TO_EMAIL_ADDRESS;

exports.handler = async (event, context, callback) => {
    const pinpoint = new Pinpoint();
    const db = await new DB();

    try {
        // db.begin();
        if (event.Records && event.Records.length > 0) {
            // Collect failed message list.
            const failed_messages = [];
            for (const record of event.Records) {
                // Write received SQS message into database.
                await db.storeSqsMessage(record);
                
                // Send message like email, sms...
                const body = JSON.parse(record.body);
                if (body.toAddress) {
                    failed_messages.push({
                        type: MESSAGE_TYPE_EMAIL,
                        destination: body.toAddress,
                        content: body.content,
                    });
                } else if (body.phone) {
                    failed_messages.push({
                        type: MESSAGE_TYPE_SMS,
                        destination: body.phone,
                        content: body.content,
                    });
                } else { continue; }
            }

            // Send failed message list.
            const content = Pinpoint.generateHTMLString(failed_messages);
            const data = {
                subject: 'Failed Message List',
                content: content,
                toAddress: alarm_to_email_address,
            };
            const request_params = Pinpoint.generateSendMessageParams_AlarmEmail({ ...data });
            await pinpoint.sendEmail(request_params);
        
        } else {}

    } catch (error) {
        //db.rollback();
    } finally {
        db.release();
    }

}