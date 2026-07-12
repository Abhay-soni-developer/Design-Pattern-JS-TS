// Bad Example

class ApplicationManager {
  async registerUser(data) {
    if (!data.email.includes("@")) {
      throw new Error("Invalid email");
    }

    const user = await database.users.insert(data);

    await emailProvider.send({
      to: user.email,
      subject: "Welcome",
    });

    console.log("User created:", user.id);

    return user;
  }

  async createOrder(orderData) {
    const order = await database.orders.insert(orderData);

    await paymentGateway.charge(order.total);
    await inventoryService.reduceStock(order.items);

    return order;
  }

  async generateReport() {
    const users = await database.users.findAll();
    const orders = await database.orders.findAll();

    return { users, orders };
  }

  async clearCache() {
    await cache.clear();
  }
}

// ApplicationManager is a God Object because it handles unrelated responsibilities:

// user registration
// validation
// persistence
// email
// logging
// order creation
// payment
// inventory
// reporting
// caching

// It knows too much and does too much.
