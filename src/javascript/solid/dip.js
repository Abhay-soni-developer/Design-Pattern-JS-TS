class INotification {
  #name;
  constructor() {
    if (new.target === INotification) {
      throw new Error("this is a interface, can not be initiated");
    }
  }

  send(message, recipient) {
    throw new Error("send is not implemented");
  }
}

class PushNotification extends INotification {
  #name;
  constructor() {
    super();
    this.#name = "PushNotification";
  }

  send(message, recipient) {
    // push notification logic
  }
}

class EmailNotification extends INotification {
  #name;
  constructor() {
    super();
    this.#name = "EmailNotification";
  }

  send(message, recipient) {
    // send email logic
  }
}

class SMSNotification extends INotification {
  #name;
  constructor() {
    super();
    this.#name = "SMSNotification";
  }

  send(message, recipient) {
    // send sms logic
  }
}

class INotificationService {
  // notifer type will INotification
  constructor(notifier) {
    if (new.target === INotificationService) {
      throw new Error("this is a interface, can not be initiated");
    }
  }

  send(message, recipient) {
    throw new Error("send is not implemented");
  }
}

class NotificationService extends INotificationService {
  constructor(notifier) {
    super();
    if (!Boolean(notifier instanceof INotification)) {
      throw new TypeError("notifier type mismatch");
    }

    this.notifier = notifier;
  }

  send(message, recipient) {
    return this.notifier.send(message, recipient);
  }
}
