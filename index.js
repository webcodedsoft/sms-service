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
let queue = null;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json(`home page hit!!!! ${process.env.AMQP_URL}`)
})

app.post('/login', async (req, res) => {
    if (req.body) {
        fetch('http://localhost:8000/api/login', {
            method: 'post',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' },
        }).then(res => res.json()).then(json => json);
    }
})

app.post('/send-sms', async (req, res) => {
    if (req.body) {
        queue = req.body.username
        console.log("Hit successfully", queue)
        connectRabbitMQ()
    } else {
        return res.status(400).json({message: "Kindly provide your username"})
    }
})


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`App listening on port ${port}`))

async function connectRabbitMQ() {
    try {
        const con = await amqp.connect(process.env.AMQP_URL || rabbitConfig);
        let channel = await con.createChannel();
        let res = await channel.assertQueue(queue)
        handleSendMessage(channel)
    } catch (error) {
        console.log("Error connecting to RabbitMQ", error);
    }
}

async function handleSendMessage(channel) {
    try {
        for (const message in messages) {
            await channel.sendToQueue(queue, Buffer.from(JSON.stringify(messages[message])));
        }
        console.log("Message sent to RabbitMQ queue")
        handleRemoveQueueMessage(channel)
    } catch (error) {
        console.log("Error sending message to RabbitMQ queue")
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