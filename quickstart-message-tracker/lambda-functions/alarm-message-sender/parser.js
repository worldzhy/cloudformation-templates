class Parser {
    // Parse MessageId from the response of Pinpoint.sendMessages()
    static parse_Pinpoint_Response(response) {
        if (response && response.MessageResponse) {
            return {
                'response_data': response,
                'response_err': null
            };
        } else {
            return {
                'response_data': null,
                'response_err': response
            };
        }
    }

    static parse_Pinpoint_Email_Messages_Response_Results(response) {
        if (response && response.MessageResponse) {
            let arr = [];
            const results = response.MessageResponse.Result;
            for (const toAddress in results) {
                arr.push({
                    'to_address': toAddress,
                    'message_id': results[toAddress].MessageId,
                    'delivery_status': results[toAddress].DeliveryStatus,
                });
            }
            return arr;
        } else {
            return [];
        }
    }

    static parse_Pinpoint_Sms_Messages_Response_Results(response) {
        return [];
    }

    // Parse messageId from SQS event
    static parseMessageId_From_Sqs_Event(record) {
        if (record) {
            return record.messageId;
        } else {
            return null;
        }
    }

    static getResponseStatusCode(resp) {
        let StatusCode;
        if (resp && resp.MessageResponse) {
            if (resp.MessageResponse.Result) {
                if (this.messageType === "email") {
                    let messageIds = [];
                    for (const i in resp.MessageResponse.Result) {
                        messageIds.push(resp.MessageResponse.Result[i].StatusMessage);
                        StatusCode = resp.MessageResponse.Result[i].StatusCode;
                    }
                    this.messageId = messageIds.join(",");
                } else {
                    for (const i in resp.MessageResponse.Result) {
                        this.messageId = resp.MessageResponse.Result[i].MessageId;
                        StatusCode = resp.MessageResponse.Result[i].StatusCode;
                    }
                }
            }
        }
        return StatusCode;
    }
}

module.exports = {
    Parser: Parser,
}