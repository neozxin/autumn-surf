// RabbitMQ steps:
// 1. Start RabbitMQ server: $ docker run --name rabbitmq -p 5672:5672 -p 15672:15672 -d rabbitmq:3-management
// 2. Open http://localhost:15672/ (user/pass: guest/guest)
// 3. publisher side: xRabbitMQUtil.queuePublisherSendMessage('test message 1');
// 4. publisher side: xRabbitMQUtil.queuePublisherSendMessage('test message 2');
// 5. consumer side: xRabbitMQUtil.queueConsumerReceiveMessage(); // receive: test message 1
// 6. consumer side: xRabbitMQUtil.queueConsumerReceiveMessage(true); // receive: test message 1
// 7. consumer side: xRabbitMQUtil.queueConsumerReceiveMessage(true); // receive: test message 2
// 8. consumer side: xRabbitMQUtil.queueConsumerReceiveMessage(true); // wait for message
const xRabbitMQUtil = {
  amqp: require("amqplib"),
  async queuePublisherSendMessage(
    message,
    queueName = "xQueue",
    amqpServer = "amqp://localhost:5672",
  ) {
    try {
      const connection = await this.amqp.connect(amqpServer);
      const channel = await connection.createChannel();
      await channel.assertQueue(queueName);
      const jsonMessage = JSON.stringify(message);
      channel.sendToQueue(queueName, Buffer.from(jsonMessage));
      console.log(`[Publisher] 已将如下内容发送至 Queue 中: ${jsonMessage}`);
      await channel.close();
      await connection.close();
    } catch (ex) {
      console.error(ex);
    }
  },
  async queueConsumerReceiveMessage(
    ackMessage = false,
    queueName = "xQueue",
    amqpServer = "amqp://localhost:5672",
  ) {
    try {
      const connection = await this.amqp.connect(amqpServer);
      const channel = await connection.createChannel();
      await channel.assertQueue(queueName);
      channel.consume(queueName, async (message) => {
        const jsonMessage = message.content.toString();
        console.log(`[Consumer] 已从 Queue 中获取如下内容: ${jsonMessage}`);
        if (ackMessage) {
          channel.ack(message);
        }
        await channel.close();
        await connection.close();
      });
      console.log("Waiting for messages...");
    } catch (ex) {
      console.error(ex);
    }
  },
};
