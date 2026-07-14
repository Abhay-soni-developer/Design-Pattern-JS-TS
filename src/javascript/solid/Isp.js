/* BAD DESIGN
    Voilates Interface segrgation principle
    any one implementing this class will need to implement all the method that they do not need 
*/
// class PaymentGateway {
//   pay() {}
//   refund() {}
//   createSubscription() {}
//   cancelSubscription() {}
//   generateInvoice() {}
// }

// Good Design: Following ISP
class Payable {
  pay() {}
}

class Refundable {
  refund() {}
}

class Subscribable {
  createSubscription() {}
  cancelSubscription() {}
}

class AccountReport {
  generateInvoice() {}
}

// now we can remove unwanted method from this class
// which we were forced to implement when we extended Payment gateway
class UpiGateway extends Payable, Refundable {
  pay() {}
  refund() {}

  //   createSubscription() {
  //     throw new Error("Not supported");
  //   }

  //   cancelSubscription() {
  //     throw new Error("Not supported");
  //   }

  //   generateInvoice() {
  //     throw new Error("Not supported");
  //   }
}

class StripeGateway extends Payable, Refundable, Subscribable, AccountReport {
  pay() {}

  refund() {}

  createSubscription() {}

  cancelSubscription() {}

  generateInvoice() {}
}

// in typescript i would have passed Subscribable for gateway type
function subscribeTo(gateway) {
    gateway.createSubscription()
}

// in typescript i would have passed Payable for gateway type
function pay(gateway) {
    gateway.pay()
}