const {Pinpoint} = require('./pinpoint.js');
const {Util} = require('./util.js');

const message_type = process.env.MESSAGE_TYPE;
const MESSAGE_TYPE_EMAIL = 'email';
const MESSAGE_TYPE_SMS = 'sms';

exports.handler = async (event, context, callback) => {
  const pinpoint = new Pinpoint();
  const util = new Util();

  try {
    if (event.Records && event.Records.length > 0) {
      for (const sqs_message of event.Records) {
        // Sending a message should be done before writing to the database
        // in case the database crashes.
        const body = JSON.parse(sqs_message.body);
        let request_params = {};
        let response = {};
        if (message_type == MESSAGE_TYPE_EMAIL) {
          if (!body.rawData) {
            request_params = Pinpoint.generateSendMessageParams_Email({
              ...body,
            });
          } else {
            request_params = Pinpoint.generateSendMessageParams_RawEmail({
              ...body,
            });
          }
          response = await pinpoint.sendEmail(request_params);
        } else if (message_type == MESSAGE_TYPE_SMS) {
          request_params = Pinpoint.generateSendMessageParams_Sms({...body});
          response = await pinpoint.sendSms(request_params);
        } else {
          continue;
        }

        // Different sleep time between two messages according to the message type.
        if (message_type == MESSAGE_TYPE_EMAIL) {
          await util.sleep(100);
        } else if (message_type == MESSAGE_TYPE_SMS) {
          await util.sleep(1000);
        } else {
          continue;
        }
      }
    }
  } catch (error) {
  } finally {
  }
};
