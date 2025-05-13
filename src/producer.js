import { NOTIFICATION_TYPES } from "./constants/notificationTypes.js";
import { Order } from "./models/Order.js";
import { Notification } from "./models/Notification.js";
import QueueService from "./services/QueueService.js";
import logger from "./utils/logger.js";

async function sendOrderNotification(type, orderData) {
  try {
    const notification = Notification.createOrderNotification(type, orderData);
    await QueueService.sendMessage(notification);
    return true;
  } catch (error) {
    logger.error("Error sending order notification:", error);
    throw error;
  }
}

async function main() {
  try {
    // Simulate order lifecycle
    for (let i = 1; i <= 5; i++) {
      const order = Order.generateMockOrder(i);

      // Order placed
      await sendOrderNotification(
        NOTIFICATION_TYPES.ORDER_PLACED,
        order.toJSON()
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Order confirmed
      await sendOrderNotification(
        NOTIFICATION_TYPES.ORDER_CONFIRMED,
        order.toJSON()
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Order shipped
      const shippedOrder = {
        ...order.toJSON(),
        trackingNumber: `TRK${Math.floor(Math.random() * 1000000)}`,
        estimatedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };
      await sendOrderNotification(
        NOTIFICATION_TYPES.ORDER_SHIPPED,
        shippedOrder
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Order delivered
      const deliveredOrder = {
        ...order.toJSON(),
        deliveredAt: new Date().toISOString(),
      };
      await sendOrderNotification(
        NOTIFICATION_TYPES.ORDER_DELIVERED,
        deliveredOrder
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    logger.error("Error in main:", error);
  } finally {
    await QueueService.close();
  }
}

// Run the example if this file is executed directly
if (process.argv[1] === import.meta.url.split("//")[1]) {
  main();
}
