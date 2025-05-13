export const NOTIFICATION_TYPES = {
  ORDER_PLACED: "order_placed",
  ORDER_CONFIRMED: "order_confirmed",
  ORDER_SHIPPED: "order_shipped",
  ORDER_DELIVERED: "order_delivered",
  ORDER_CANCELLED: "order_cancelled",
};

export const NOTIFICATION_CHANNELS = {
  EMAIL: "email",
  SMS: "sms",
};

export const QUEUE_CONFIG = {
  NAME: "order_notifications",
  TTL: 86400000, // 24 hours in milliseconds
  PERSISTENT: true,
};

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
  ERROR_PROBABILITY: 0.3, // 30% chance of error
};
