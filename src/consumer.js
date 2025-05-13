import { Notification } from "./models/Notification.js";
import QueueService from "./services/QueueService.js";
import NotificationService from "./services/NotificationService.js";
import { RETRY_CONFIG } from "./constants/notificationTypes.js";
import logger from "./utils/logger.js";

async function processMessage(msg) {
  try {
    const notification = JSON.parse(msg.content.toString());
    const retryCount = notification.metadata?.retryCount || 0;

    logger.info(`Processing notification: ${JSON.stringify(notification)}`);
    logger.info(`Attempt ${retryCount + 1} of ${RETRY_CONFIG.MAX_RETRIES + 1}`);

    // Validate notification
    if (!notification.type || !notification.orderData) {
      throw new Error("Invalid notification format");
    }

    // Process the notification
    const success = await NotificationService.sendNotification(notification);

    if (success) {
      // Log success
      logger.info(
        `Successfully processed ${notification.type} notification for order ${notification.orderData.orderId}`
      );
      return true;
    } else {
      // If processing failed but we haven't reached max retries, requeue
      if (retryCount < RETRY_CONFIG.MAX_RETRIES) {
        logger.info(`Requeuing notification for retry ${retryCount + 1}`);
        return false; // This will trigger a nack and requeue
      } else {
        logger.error(
          `Max retries reached for notification. Moving to dead letter queue.`
        );
        return true; // This will ack the message and stop retrying
      }
    }
  } catch (error) {
    logger.error("Error processing notification:", error);
    return false;
  }
}

async function startConsumer() {
  try {
    await QueueService.consume(processMessage);
    logger.info("Notification consumer started successfully");
  } catch (error) {
    logger.error("Error starting consumer:", error);
    throw error;
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down notification consumer...");
  await QueueService.close();
  process.exit(0);
});

// Start the consumer if this file is executed directly
if (process.argv[1] === import.meta.url) {
  startConsumer().catch((error) => {
    logger.error("Fatal error:", error);
    process.exit(1);
  });
}
