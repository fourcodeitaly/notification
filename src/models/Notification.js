import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";

export class Notification {
  constructor({
    type,
    orderData,
    timestamp = new Date().toISOString(),
    metadata = {
      source: "e-commerce-platform",
      version: "1.0",
    },
  }) {
    this.type = type;
    this.orderData = orderData;
    this.timestamp = timestamp;
    this.metadata = metadata;
  }

  static createOrderNotification(type, orderData) {
    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    return new Notification({
      type,
      orderData,
      timestamp: new Date().toISOString(),
    });
  }

  toJSON() {
    return {
      type: this.type,
      orderData: this.orderData,
      timestamp: this.timestamp,
      metadata: this.metadata,
    };
  }

  toBuffer() {
    return Buffer.from(JSON.stringify(this.toJSON()));
  }
}
