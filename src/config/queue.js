import amqp from "amqplib";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const QUEUE_NAME = process.env.QUEUE_NAME || "order_notifications";

// Define notification types
export const NOTIFICATION_TYPES = {
  ORDER_PLACED: "order_placed",
  ORDER_CONFIRMED: "order_confirmed",
  ORDER_SHIPPED: "order_shipped",
  ORDER_DELIVERED: "order_delivered",
  ORDER_CANCELLED: "order_cancelled",
};

let connection = null;
let channel = null;

export async function connectToQueue() {
  try {
    if (!connection) {
      connection = await amqp.connect(RABBITMQ_URL);
      logger.info("Connected to RabbitMQ");

      connection.on("error", (err) => {
        logger.error("RabbitMQ connection error:", err);
        connection = null;
      });

      connection.on("close", () => {
        logger.warn("RabbitMQ connection closed");
        connection = null;
      });
    }

    if (!channel) {
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, {
        durable: true,
        arguments: {
          "x-message-ttl": 86400000, // Messages expire after 24 hours
        },
      });
      logger.info(`Queue ${QUEUE_NAME} is ready`);
    }

    return { connection, channel };
  } catch (error) {
    logger.error("Error connecting to RabbitMQ:", error);
    throw error;
  }
}

export async function closeConnection() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    logger.info("RabbitMQ connection closed");
  } catch (error) {
    logger.error("Error closing RabbitMQ connection:", error);
    throw error;
  }
}

export { QUEUE_NAME };
