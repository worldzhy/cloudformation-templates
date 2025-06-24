const AWS = require('aws-sdk');
const moment = require('moment');
const {DB} = require('./db.js');

exports.handler = async (event, context, callback) => {
  const s3 = new AWS.S3();
  const db = await new DB();

  // Read options from the event parameter.
  let srcBucket = '';
  let srcKey = '';
  if (event.Records) {
    // !! The lambda function is triggered by S3 Event Notifications.

    srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    srcKey = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, ' ')
    );
  } else {
    // !! The lambda function is triggered by CloudWatch EventBridge.

    srcBucket = event.detail.bucket.name;
    srcKey = decodeURIComponent(event.detail.object.key.replace(/\+/g, ' '));
  }

  // Download the  stream file from the S3 source bucket.
  try {
    const params = {
      Bucket: srcBucket,
      Key: srcKey,
    };
    var eventStreamFile = await s3.getObject(params).promise();

    const eventStrings = eventStreamFile.Body.toString().split('\n');
    const events = [];
    for (const eventString of eventStrings) {
      if (eventString.length > 0) {
        events.push(JSON.parse(eventString));
      }
    }
    const smsEvents = [];
    const emailEvents = [];

    const newEvents = events.map((event) => {
      const {event_type} = event;
      if (event_type.startsWith('_email')) {
        const emailEvent = {
          message_id: event.facets.email_channel.mail_event.mail.message_id,
          event_type: event.event_type,
          event_timestamp: event.event_timestamp
            ? moment(event.event_timestamp).format('YYYY-MM-DD HH:mm:ss')
            : null,
          arrival_timestamp: event.arrival_timestamp
            ? moment(event.arrival_timestamp).format('YYYY-MM-DD HH:mm:ss')
            : null,
          event_version: event.event_version,
          application: JSON.stringify(event.application),
          client: JSON.stringify(event.client),
          device: JSON.stringify(event.device),
          session: JSON.stringify(event.session),
          attributes: JSON.stringify(event.attributes),
          clientContext: null,
          facets: JSON.stringify(event.facets),
          awsAccountId: event.awsAccountId,
        };
        emailEvent.application = emailEvent.application.replace(/\'/g, "''");
        emailEvent.client = emailEvent.client.replace(/\'/g, "''");
        emailEvent.device = emailEvent.device.replace(/\'/g, "''");
        emailEvent.session = emailEvent.session.replace(/\'/g, "''");
        emailEvent.attributes = emailEvent.attributes.replace(/\'/g, "''");
        emailEvent.facets = emailEvent.facets.replace(/\'/g, "''");
        emailEvents.push(emailEvent);
        return emailEvent;
      } else if (event_type.startsWith('_SMS')) {
        const smsEvent = {
          message_id: event.attributes.message_id,
          event_type: event.event_type,
          event_timestamp: event.event_timestamp
            ? moment(event.event_timestamp).format('YYYY-MM-DD HH:mm:ss')
            : null,
          arrival_timestamp: event.arrival_timestamp
            ? moment(event.arrival_timestamp).format('YYYY-MM-DD HH:mm:ss')
            : null,
          event_version: event.event_version,
          application: JSON.stringify(event.application),
          client: JSON.stringify(event.client),
          device: JSON.stringify(event.device),
          session: JSON.stringify(event.session),
          attributes: JSON.stringify(event.attributes),
          metrics: JSON.stringify(event.metrics),
          awsAccountId: event.awsAccountId,
        };
        smsEvent.application = smsEvent.application.replace(/\'/g, "''");
        smsEvent.client = smsEvent.client.replace(/\'/g, "''");
        smsEvent.device = smsEvent.device.replace(/\'/g, "''");
        smsEvent.session = smsEvent.session.replace(/\'/g, "''");
        smsEvent.attribute = smsEvent.attributes.replace(/\'/g, "''");
        smsEvent.metrics = smsEvent.metrics.replace(/\'/g, "''");
        smsEvents.push(smsEvent);
        return smsEvent;
      } else {
        console.log('event type error.');
      }
    });

    if (emailEvents.length > 0) {
      await db.storeEmailEvents(emailEvents);
    }

    if (smsEvents.length > 0) {
      await db.storeSmsEvents(smsEvents);
    }
  } catch (error) {
    console.log(error);
    return;
  } finally {
    db.releaseConnect();
  }
};
