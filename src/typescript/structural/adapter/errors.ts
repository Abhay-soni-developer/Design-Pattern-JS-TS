export class PartnerCustomerMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidDate extends PartnerCustomerMappingError {
  constructor() {
    super("Invalid or missing Date Value");
  }
}

export class InvalidName extends PartnerCustomerMappingError {
  constructor() {
    super("Invalid or missing name");
  }
}

export class InvalidStatus extends PartnerCustomerMappingError {
  constructor() {
    super("Invalid status value");
  }
}

export class NotificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotificationSendingFail extends NotificationError {
  constructor() {
    super("notification sending fail");
  }
}
