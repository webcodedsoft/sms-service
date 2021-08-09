const amqp = require('amqplib');
const messages = require('./data/datas.json');
const express = require('express')
const fetch = require('node-fetch');

const app = express()

const rabbitConfig = {
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
}
let queue = "sms_sender";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectRabbitMQ()

async function connectRabbitMQ() {
    try {
        const con = await amqp.connect(process.env.AMQP_URL || rabbitConfig);
        let channel = await con.createChannel();
        let res = await channel.assertQueue(queue)
        handleRemoveQueueMessage(channel)
    } catch (error) {
        console.log("Error connecting to RabbitMQ", error);
    }
}

async function handleRemoveQueueMessage(channel) {
    channel.consume(queue, queueMessage => {
        let sms = JSON.parse(queueMessage.content.toString());
        console.log("Received sms from RabbitMQ queue", sms.id)
        console.log("SMS successfully removed from RabbitMQ queue", sms.id);
    }, {
        noAck: true
    });
}