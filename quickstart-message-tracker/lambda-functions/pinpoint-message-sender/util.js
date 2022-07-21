class Util {
    constructor() {
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async notify(data) {
        const {
            records,
            emailAddresses,
            smsReceivers,
            smsKeyWord,
            smsMessageType,
        } = data;
        const htmlParseRecords = [];
        for (const record of records) {
            const body = JSON.parse(record.body);
            const moduleRecordId = body.moduleRecordId;
            const moduleRecordType = body.moduleRecordType;
            if (moduleRecordId && moduleRecordType) {
                if (moduleRecordType === 'email') {
                    const emailParams = await this.getEmailParams(moduleRecordId);
                    htmlParseRecords.push({
                        type: 'Email',
                        destination: emailParams.toAddress,
                        content: emailParams.content,
                    });
                } else if (moduleRecordType === 'sms') {
                    const smsParams = await this.getSmsParams(moduleRecordId);
                    htmlParseRecords.push({
                        type: 'Sms',
                        destination: smsParams.phone,
                        content: smsParams.content,
                    });
                }
            }
        }
        if (Array.isArray(htmlParseRecords)) {
            if (Array.isArray(emailAddresses) && emailAddresses.length) {
                const emailSubject = 'Send Failed List';
                const emailContent = this.buildInternalNotifyEmailContent(htmlParseRecords);
                for (const emailAddress of emailAddresses) {
                    const emailData = {
                        subject: emailSubject,
                        content: emailContent,
                        toAddress: emailAddress,
                        applicationId: this.config.pinpointAppId,
                        fromAddress: this.config.pinpointEmailFromAddress,
                    };
                    await this.sendEmail(emailData);
                }
            }
            if (Array.isArray(smsReceivers) && smsReceivers.length) {
                for (const smsReceiver of smsReceivers) {
                    const smsData = {
                        applicationId: this.config.pinpointAppId,
                        content,
                        keyword: smsKeyWord,
                        messageType: smsMessageType,
                    };
                    await this.sendSms(smsData);
                }
            }
        }
    }

    buildInternalNotifyEmailContent(records) {
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
    Util: Util,
}