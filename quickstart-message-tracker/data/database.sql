-- DROP SCHEMA message;

CREATE SCHEMA _message AUTHORIZATION postgres;


-- _message.failed_sqs_messages definition

-- Drop table

-- DROP TABLE _message.failed_sqs_messages;

CREATE TABLE _message.failed_sqs_messages (
	id serial PRIMARY KEY,
	"type" varchar NULL,
	sqs_message_id varchar NULL,
	message_body jsonb NULL,
	"event" jsonb NULL
);


-- _message.pinpoint_events_email definition

-- Drop table

-- DROP TABLE _message.pinpoint_events_email;

CREATE TABLE _message.pinpoint_events_email (
	id serial PRIMARY KEY,
	pinpoint_message_id varchar NULL,
	event_type varchar NULL,
	"event" jsonb NULL
);


-- _message.pinpoint_events_sms definition

-- Drop table

-- DROP TABLE _message.pinpoint_events_sms;

CREATE TABLE _message.pinpoint_events_sms (
	id serial PRIMARY KEY,
	pinpoint_message_id varchar NULL,
	event_type varchar NULL,
	"event" jsonb NULL
);


-- _message.received_sqs_messages definition

-- Drop table

-- DROP TABLE _message.received_sqs_messages;

CREATE TABLE _message.received_sqs_messages (
	id serial PRIMARY KEY,
	"type" varchar NULL,
	"level" int4 NULL,
	sqs_message_id varchar NULL,
	message_body jsonb NULL,
	"event" jsonb NULL
);


-- _message.sent_pinpoint_messages definition

-- Drop table

-- DROP TABLE _message.sent_pinpoint_messages;

CREATE TABLE _message.sent_pinpoint_messages (
	id serial PRIMARY KEY,
	"type" varchar NULL,
	"level" int4 NULL,
	request_params jsonb NULL,
	response_data jsonb NULL,
	response_err jsonb NULL,
	pinpoint_message_id varchar NULL,
	delivery_status varchar NULL,
	sqs_message_id varchar NULL
);
