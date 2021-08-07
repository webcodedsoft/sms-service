const amqp = require('amqplib');
const messages = require('./data');

const rabbitConfig = {
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
}
let queue = "sms";

connectRabbitMQ()

async function connectRabbitMQ() {
    try {
        const con = await amqp.connect(rabbitConfig);
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
        console.log("Received sms from RabbitMQ queue")
        if (sms) {
            console.log("SMS successfully removed from RabbitMQ queue");
        } else {
            console.log("No SMS to removed from RabbitMQ queue");
        }
        // console.log(" [x] Received %s", msg.content.toString());
    }, {
        noAck: true
    });
    
    channel.consume(queue, queueMessage => {
        let sms = JSON.parse(queueMessage.content.toString());
        console.log("Received sms from RabbitMQ queue")
        if (sms) {

            channel.nack(sms)
            console.log("SMS successfully removed from RabbitMQ queue");
        } else {
            console.log("No SMS to removed from RabbitMQ queue");
        }
    });
}