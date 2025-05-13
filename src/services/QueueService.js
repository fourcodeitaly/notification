import amqp from "amqplib";
import { QUEUE_CONFIG } from "../constants/notificationTypes.js";
import logger from "../utils/logger.js";

class QueueService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
  }

  async connect() {
    try {
      if (!this.connection) {
        this.connection = await amqp.connect(this.RABBITMQ_URL);
        logger.info("Connected to RabbitMQ");

        this.connection.on("error", (err) => {
          logger.error("RabbitMQ connection error:", err);
          this.connection = null;
        });

        this.connection.on("close", () => {
          logger.warn("RabbitMQ connection closed");
          this.connection = null;
        });
      }

      if (!this.channel) {
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(QUEUE_CONFIG.NAME, {
          durable: QUEUE_CONFIG.PERSISTENT,
          arguments: {
            "x-message-ttl": QUEUE_CONFIG.TTL,
          },
        });
        logger.info(`Queue ${QUEUE_CONFIG.NAME} is ready`);
      }

      return { connection: this.connection, channel: this.channel };
    } catch (error) {
      logger.error("Error connecting to RabbitMQ:", error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      logger.info("RabbitMQ connection closed");
    } catch (error) {
      logger.error("Error closing RabbitMQ connection:", error);
      throw error;
    }
  }

  async sendMessage(message) {
    try {
      const { channel } = await this.connect();

      channel.sendToQueue(QUEUE_CONFIG.NAME, message.toBuffer(), {
        persistent: QUEUE_CONFIG.PERSISTENT,
        headers: {
          "notification-type": message.type,
        },
      });

      logger.info(`Message sent: ${JSON.stringify(message.toJSON())}`);
      return true;
    } catch (error) {
      logger.error("Error sending message:", error);
      throw error;
    }
  }

  async consume(callback) {
    try {
      const { channel } = await this.connect();

      channel.consume(QUEUE_CONFIG.NAME, async (msg) => {
        if (msg !== null) {
          const success = await callback(msg);
          if (success) {
            channel.ack(msg);
          } else {
            channel.nack(msg, false, true);
          }
        }
      });

      logger.info("Consumer started successfully");
    } catch (error) {
      logger.error("Error starting consumer:", error);
      throw error;
    }
  }
}

export default new QueueService();
