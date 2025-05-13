export class Order {
  constructor({
    orderId,
    customer,
    items,
    totalAmount,
    shippingAddress,
    status = "pending",
    trackingNumber = null,
    estimatedDelivery = null,
    deliveredAt = null,
  }) {
    this.orderId = orderId;
    this.customer = customer;
    this.items = items;
    this.totalAmount = totalAmount;
    this.shippingAddress = shippingAddress;
    this.status = status;
    this.trackingNumber = trackingNumber;
    this.estimatedDelivery = estimatedDelivery;
    this.deliveredAt = deliveredAt;
  }

  static generateMockOrder(orderId) {
    return new Order({
      orderId,
      customer: {
        id: `CUST${Math.floor(Math.random() * 1000)}`,
        name: `Customer ${orderId}`,
        email: `customer${orderId}@example.com`,
        phone: `+1${Math.floor(Math.random() * 1000000000)}`,
      },
      items: [
        {
          id: `ITEM${Math.floor(Math.random() * 1000)}`,
          name: `Product ${Math.floor(Math.random() * 5) + 1}`,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: (Math.random() * 100).toFixed(2),
        },
      ],
      totalAmount: (Math.random() * 1000).toFixed(2),
      shippingAddress: {
        street: `${Math.floor(Math.random() * 1000)} Main St`,
        city: "Sample City",
        state: "Sample State",
        zipCode: `${Math.floor(Math.random() * 10000)}`,
        country: "Sample Country",
      },
    });
  }

  toJSON() {
    return {
      orderId: this.orderId,
      customer: this.customer,
      items: this.items,
      totalAmount: this.totalAmount,
      shippingAddress: this.shippingAddress,
      status: this.status,
      trackingNumber: this.trackingNumber,
      estimatedDelivery: this.estimatedDelivery,
      deliveredAt: this.deliveredAt,
    };
  }
}
