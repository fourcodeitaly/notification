# E-commerce Order Notification System

A Node.js application that demonstrates the use of RabbitMQ for handling order notifications in an e-commerce platform. The system processes various order status updates and sends notifications to customers through different channels.

## Features

- Order lifecycle notifications (placed, confirmed, shipped, delivered, cancelled)
- Multi-channel notifications (email, SMS)
- Reliable message delivery with persistence
- Message expiration after 24 hours
- Comprehensive error handling and logging
- Docker support for easy deployment

## Prerequisites

- Node.js (v14 or higher)
- RabbitMQ server

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your RabbitMQ configuration:
```
RABBITMQ_URL=amqp://localhost:5672
QUEUE_NAME=order_notifications
LOG_LEVEL=info
```

## Running RabbitMQ

### Using Docker (Recommended)

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

The RabbitMQ management interface will be available at http://localhost:15672 (default credentials: guest/guest)

### Local Installation

Follow the [official RabbitMQ installation guide](https://www.rabbitmq.com/download.html) for your operating system.

## Running the Application

1. Start the notification consumer in one terminal:
```bash
npm run start:consumer
```

2. Start the order producer in another terminal:
```bash
npm run start:producer
```

## How It Works

1. The producer simulates an e-commerce platform sending order notifications:
   - Order placed
   - Order confirmed
   - Order shipped (with tracking information)
   - Order delivered
   - Order cancelled

2. The consumer processes these notifications and simulates sending them to customers through:
   - Email notifications
   - SMS notifications

3. Each notification is:
   - Persisted to disk
   - Acknowledged after successful processing
   - Automatically requeued if processing fails
   - Expired after 24 hours if not processed

## Project Structure

```
.
├── src/
│   ├── config/
│   │   └── queue.js      # RabbitMQ connection and queue configuration
│   ├── producer.js       # Order notification producer
│   └── consumer.js       # Notification processor and sender
├── .env.example         # Example environment variables
├── package.json         # Project dependencies and scripts
└── README.md           # This file
```

## Error Handling

- Comprehensive error handling for all operations
- Failed notifications are automatically requeued
- Connection errors are handled gracefully with reconnection attempts
- Invalid notifications are logged and rejected

## Logging

The application uses Winston for structured logging. Logs include:
- Timestamps
- Notification types
- Customer information
- Processing status
- Error details

## Docker Support

The application includes Docker and Docker Compose support for easy deployment:

```bash
docker-compose up
```

This will start:
- RabbitMQ server
- Notification consumer
- Order producer

## License

ISC # notification
