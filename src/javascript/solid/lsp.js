/*
### LSP Design Improvement — Shared Contract + Template Method

A good LSP design is not just about making child classes implement 
the same methods—it is about making every child preserve the same behavioral contract. 
In our notification example, the parent class defines a common `send()` 
workflow (Template Method): validate the request using `canSend()`, 
return a standardized failure response if validation fails, otherwise 
delegate the actual sending to `deliver()`. This keeps the algorithm 
consistent while allowing each notification channel to provide its own 
validation and delivery logic. We also identified that channel identity (`email`, `sms`, `push`) 
is class-level metadata rather than instance state, making a static `channelName` 
(accessed via `this.constructor.channelName`) a better design choice. 
The final result satisfies LSP because every notification channel exposes the same contract, 
follows the same execution flow, returns the same response shape, and can be substituted
 without requiring special handling in the client code.

*/

class NotificationChannel {
  static _channelName;

  constructor() {
    if (new.target === NotificationChannel) {
      throw Error("this class can not be intiated");
    }
  }

  /*
    Input: {message: string, recipient: Recipient}
    Recipient: {deviceToken: string, channelName: string}
    
    Output: {success: boolean, channel: string, recipient: Recipient, message: string, error: null | Error}

    // child classes can have their own validation and processing logic
    so from inside you should call canSend to validate the message and recipient before trying to send
*/
  send(message, recipient) {
    const isSendable = this.canSend(message, recipient);

    if (!isSendable.success) {
      return {
        ...isSendable,
        channel: this._channelName,
        recipient,
        message,
      };
    }

    return this.deliver(message, recipient);
  }

  /*
    Input: {message: string, recipient: Recipient}
    Recipient: {deviceToken: string, channelName: string}

    Output: {
        success: boolean,
        error: success ? null : error
        }
  */
  canSend(message, recipient) {
    // validation logic
    throw new Error("Not implemented");
  }

  /*
    Input: {message: string, recipient: Recipient}
    Recipient: {deviceToken: string, channelName: string}

    Output: {success: boolean, channel: string, recipient: Recipient, message: string, error: null | Error}

  */
  deliver(message, recipient) {
    throw new Error("Not implemented");
  }
}

class EmailNotification extends NotificationChannel {
  static _channelName = "email";

  deliver(message, recipient) {
    // logic
    return {
      success: true,
      channel: this._channelName,
      recipient,
      message,
      error: null,
    };
  }

  canSend(message, recipient) {
    return {
      success: true,
      error: null,
    };
  }
}

class SmsNotification extends NotificationChannel {
  static _channelName = "sms";

  deliver(message, recipient) {
    // logic
    return {
      success: true,
      channel: this._channelName,
      recipient,
      message,
      error: null,
    };
  }

  canSend(message, recipient) {
    if (message.length > 160) {
      return {
        success: false,
        error: new Error("SMS message is too long"),
      };
    }

    return {
      success: true,
      error: null,
    };
  }
}

class PushNotification extends NotificationChannel {
  static _channelName = "push";

  deliver(message, recipient) {
    // logic
    return {
      success: true,
      channel: this._channelName,
      recipient,
      message,
      error: null,
    };
  }

  canSend(message, recipient) {
    if (!recipient.deviceToken) {
      return {
        success: false,
        error: new Error("Device token is required"),
      };
    }

    return {
      success: true,
      error: null,
    };
  }
}
