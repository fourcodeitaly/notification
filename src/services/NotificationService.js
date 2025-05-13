import {
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  RETRY_CONFIG,
} from "../constants/notificationTypes.js";
import logger from "../utils/logger.js";

class NotificationService {
  async sendNotification(notification) {
    const { type, orderData } = notification;
    const { customer } = orderData;
    const retryCount = notification.metadata?.retryCount || 0;

    try {
      // Simulate random errors
      if (this.shouldSimulateError() && retryCount < RETRY_CONFIG.MAX_RETRIES) {
        throw new Error(`Simulated error for ${type} notification`);
      }

      switch (type) {
        case NOTIFICATION_TYPES.ORDER_PLACED:
          await this.sendOrderPlacedNotification(customer);
          break;

        case NOTIFICATION_TYPES.ORDER_CONFIRMED:
          await this.sendOrderConfirmedNotification(customer);
          break;

        case NOTIFICATION_TYPES.ORDER_SHIPPED:
          await this.sendOrderShippedNotification(customer, orderData);
          break;

        case NOTIFICATION_TYPES.ORDER_DELIVERED:
          await this.sendOrderDeliveredNotification(customer);
          break;

        case NOTIFICATION_TYPES.ORDER_CANCELLED:
          await this.sendOrderCancelledNotification(customer);
          break;

        default:
          logger.warn(`Unknown notification type: ${type}`);
      }

      logger.info(
        `Successfully processed ${type} notification (attempt ${
          retryCount + 1
        })`
      );
      return true;
    } catch (error) {
      logger.error(
        `Error processing ${type} notification (attempt ${retryCount + 1}):`,
        error.message
      );

      if (retryCount >= RETRY_CONFIG.MAX_RETRIES) {
        logger.error(
          `Max retries (${RETRY_CONFIG.MAX_RETRIES}) reached for ${type} notification`
        );
        return false;
      }

      // Add retry information to metadata
      notification.metadata = {
        ...notification.metadata,
        retryCount: retryCount + 1,
        lastError: error.message,
        nextRetry: new Date(
          Date.now() + RETRY_CONFIG.RETRY_DELAY
        ).toISOString(),
      };

      // Simulate retry delay
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_CONFIG.RETRY_DELAY)
      );
      return false;
    }
  }

  shouldSimulateError() {
    return Math.random() < RETRY_CONFIG.ERROR_PROBABILITY;
  }

  async sendOrderPlacedNotification(customer) {
    // Simulate sending email
    logger.info(`📧 Sending order confirmation email to ${customer.email}`);
    // Simulate sending SMS
    logger.info(`📱 Sending SMS to ${customer.phone}`);
    await this.simulateProcessingDelay();
  }

  async sendOrderConfirmedNotification(customer) {
    logger.info(`📧 Sending order details email to ${customer.email}`);
    await this.simulateProcessingDelay();
  }

  async sendOrderShippedNotification(customer, orderData) {
    logger.info(`📧 Sending shipping confirmation email to ${customer.email}`);
    logger.info(`📱 Sending tracking SMS to ${customer.phone}`);
    logger.info(`📦 Tracking Number: ${orderData.trackingNumber}`);
    logger.info(`📅 Estimated Delivery: ${orderData.estimatedDelivery}`);
    await this.simulateProcessingDelay();
  }

  async sendOrderDeliveredNotification(customer) {
    logger.info(`📧 Sending delivery confirmation email to ${customer.email}`);
    logger.info(`📱 Sending delivery confirmation SMS to ${customer.phone}`);
    await this.simulateProcessingDelay();
  }

  async sendOrderCancelledNotification(customer) {
    logger.info(`📧 Sending cancellation email to ${customer.email}`);
    logger.info(`📱 Sending cancellation SMS to ${customer.phone}`);
    await this.simulateProcessingDelay();
  }

  async simulateProcessingDelay() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export default new NotificationService();
