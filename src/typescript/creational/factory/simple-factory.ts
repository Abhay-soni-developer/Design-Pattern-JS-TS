import readline from "node:readline";

interface IPayment {
  pay(amount: number): Promise<void>;
}

class StripePayment implements IPayment {
  async pay(amount: number): Promise<void> {
    console.log(`Payment of INR ${amount} completed via Stripe`);
  }
}

class PaytmPayment implements IPayment {
  async pay(amount: number): Promise<void> {
    console.log(`Payment of INR ${amount} completed via Paytm`);
  }
}

class GooglePayPayment implements IPayment {
  async pay(amount: number): Promise<void> {
    console.log(`Payment of INR ${amount} completed via Google Pay`);
  }
}

enum PaymentGateway {
  STRIPE = 1,
  PAYTM = 2,
  GOOGLE_PAY = 3,
}

class PaymentFactory {
  static create(selectedGateway: PaymentFactory) {
    switch (selectedGateway) {
      case PaymentGateway.STRIPE:
        return new StripePayment();

      case PaymentGateway.PAYTM:
        return new PaytmPayment();

      case PaymentGateway.GOOGLE_PAY:
        return new GooglePayPayment();

      default:
        throw new Error("Unsupported payment gateway");
    }
  }
}

class CheckoutService {
  private static q1: string = `
Choose a payment gateway:

1. Stripe
2. Paytm
3. Google Pay

Enter option: `;

  private static q2: string = `
Enter the amount to pay: `;

  private readonly rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async checkout(): Promise<void> {
    try {
      const gatewayInput = await this.askQuestion(CheckoutService.q1);

      const amountInput = await this.askQuestion(CheckoutService.q2);

      const selectedGateway = Number(gatewayInput);
      const amount = Number(amountInput);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Payment amount must be a positive number");
      }

      let payment: IPayment = PaymentFactory.create(selectedGateway);

      await payment.pay(amount);

      console.log("Checkout completed successfully");
    } finally {
      this.rl.close();
    }
  }
}

async function main(): Promise<void> {
  const checkoutService = new CheckoutService();

  try {
    await checkoutService.checkout();
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Unexpected checkout failure",
    );
  }
}

void main();
