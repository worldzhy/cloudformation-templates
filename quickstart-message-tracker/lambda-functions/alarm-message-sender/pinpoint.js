const aws = require('aws-sdk')

const pinpointAppId = process.env.PINPOINT_APP_ID;
const fromEmailAddress = process.env.FROM_EMAIL_ADDRESS;

class Pinpoint {
    constructor() {
        this.pinpoint = new aws.Pinpoint();
    }

    async sendEmail(params) {
        return this.pinpoint.sendMessages(params).promise();
    }

    async sendSms(params) {
        return this.pinpoint.sendMessages(params).promise();
    }
    
    // Construct params for Pinpoint.sendMessages()
    static generateSendMessageParams_Email(data) {
        return {
            ApplicationId: pinpointAppId,
            MessageRequest: {
                Addresses: {
                    [data.toAddress]: {
                        ChannelType: 'EMAIL',
                    },
                },
                MessageConfiguration: {
                    EmailMessage: {
                        FromAddress: fromEmailAddress,
                        SimpleEmail: {
                            Subject: {
                                Charset: 'UTF-8',
                                Data: data.subject,
                            },
                            HtmlPart: {
                                Charset: 'UTF-8',
                                Data: data.content,
                            },
                        },
                    },
                },
            },
        };
    }

    static generateSendMessageParams_AlarmEmail(data) {
        return {
            ApplicationId: pinpointAppId,
            MessageRequest: {
                Addresses: {
                    [data.toAddress]: {
                        ChannelType: 'EMAIL',
                    },
                },
                MessageConfiguration: {
                    EmailMessage: {
                        FromAddress: fromEmailAddress,
                        SimpleEmail: {
                            Subject: {
                                Charset: 'UTF-8',
                                Data: data.subject,
                            },
                            HtmlPart: {
                                Charset: 'UTF-8',
                                Data: data.content,
                            },
                        },
                    },
                },
            },
        };
    }

    static generateSendMessageParams_RawEmail(data) {
        return {
            ApplicationId: pinpointAppId,
            MessageRequest: {
                Addresses: {
                    [data.toAddress]: {
                        ChannelType: 'EMAIL',
                    },
                },
                MessageConfiguration: {
                    EmailMessage: {
                        FromAddress: fromEmailAddress,
                        RawEmail: {
                            Data: data.rawData,
                        },
                    },
                },
            },
        };
    }

    static generateSendMessageParams_Sms(data) {
        return {
            ApplicationId: pinpointAppId,
            MessageRequest: {
                Addresses: {
                    [data.phone]: {
                        ChannelType: 'SMS',
                    },
                },
                MessageConfiguration: {
                    SMSMessage: {
                        Body: data.content,
                        Keyword: data.keyword,
                        MessageType: data.messageType,
                        SenderId: data.senderId,
                    },
                },
            },
        };
    }

    static generateHTMLString(records) {
        let htmlStr = `
        <!doctype html>
        <html>
            <head>
                <title>Send Failed List</title>
                <meta charset="utf-8" />
            </head>
            <body>
                <table>
                    <tr>
                        <td>Type</td>
                        <td>Destination</td>
                        <td>Content</td>
                    </tr> 
        `;
        for (const record of records) {
            const {
                type,
                destination,
                content,
            } = record;
            htmlStr += `
                <tr>
                    <td>${type}</td>
                    <td>${destination}</td>
                    <td><pre>${content}</pre></td>
                </tr>
            `;
        }
        htmlStr += `
                </table>
            </body>
        </html>
        `;
        return htmlStr;
    }
}

module.exports = {
    Pinpoint: Pinpoint,
}