import z from "zod";

type Recipient =
  | {
      name: string;
      contactType: "email";
      contact: string;
    }
  | {
      name: string;
      contactType: "phone";
      contact: string;
    }
  | {
      name: string;
      contactType: "deviceToken";
      contact: string;
    }
  | {
      name: string;
      contactType: "address";
      contact: Address;
    };

interface Address {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface DocumentContent {
  title: string;
  body: string;
  recipientInformation: Recipient;
  preparationRules: any;
}

interface DeliveryResult {
  success: boolean;
  recipientInformation: Recipient;
  error: Error | null;
}

interface IDocument {
  deliver(content: DocumentContent): Promise<DeliveryResult>;
}

abstract class DeliveryChannel {
  protected readonly name: string;
  protected readonly documentSchemaValidator: z.ZodType<DocumentContent>;

  // todo: we can make this generic, so it does not accept all type of recipients
  constructor(payloadValidator: z.ZodType<DocumentContent>) {
    this.name = new.target.name;
    this.documentSchemaValidator = payloadValidator;
  }

  protected validate(content: DocumentContent): DocumentContent {
    return this.documentSchemaValidator.parse(content);
  }
  protected abstract send(content: DocumentContent): Promise<DeliveryResult>;

  validateAndSend(content: DocumentContent): Promise<DeliveryResult> {
    try {
      return this.send(this.validate(content));
    } catch (err) {
      throw err;
    }
  }
}

const content: DocumentContent = {
  title: "",
  body: "",
  recipientInformation: {
    name: "",
    contactType: "phone",
    contact: "",
  },
  preparationRules: undefined,
};

class EmailDeliveryChannel extends DeliveryChannel {
  constructor() {
    super(
      createDocumentContentValidator({
        maxBodyLen: 2000,
        maxTitleLen: 300,
      }),
    );
  }

  protected send(content: DocumentContent): Promise<DeliveryResult> {
    try {
      console.log(`sending the ${content.title} via ${this.name}`);
      return Promise.resolve({
        success: true,
        recipientInformation: content.recipientInformation,
        error: null,
      });
    } catch (err) {
      return Promise.resolve({
        success: false,
        recipientInformation: content.recipientInformation,
        error: err as Error,
      });
    }
  }
}

class SmsDeliveryChannel extends DeliveryChannel {
  constructor() {
    super(
      createDocumentContentValidator({
        maxBodyLen: 1000,
        maxTitleLen: 10,
      }),
    );
  }

  protected send(content: DocumentContent): Promise<DeliveryResult> {
    try {
      console.log(`sending the ${content.title} via ${this.name}`);
      return Promise.resolve({
        success: true,
        recipientInformation: content.recipientInformation,
        error: null,
      });
    } catch (err) {
      return Promise.resolve({
        success: false,
        recipientInformation: content.recipientInformation,
        error: err as Error,
      });
    }
  }
}

class PushDeliveryChannel extends DeliveryChannel {
  constructor() {
    super(
      createDocumentContentValidator({
        maxBodyLen: 500,
        maxTitleLen: 50,
      }),
    );
  }

  protected send(content: DocumentContent): Promise<DeliveryResult> {
    try {
      console.log(`sending the ${content.title} via ${this.name}`);
      return Promise.resolve({
        success: true,
        recipientInformation: content.recipientInformation,
        error: null,
      });
    } catch (err) {
      return Promise.resolve({
        success: false,
        recipientInformation: content.recipientInformation,
        error: err as Error,
      });
    }
  }
}

class PhysicalMailDeliveryChannel extends DeliveryChannel {
  constructor() {
    super(
      createDocumentContentValidator({
        maxBodyLen: 4000,
        maxTitleLen: 300,
      }),
    );
  }

  protected send(content: DocumentContent): Promise<DeliveryResult> {
    try {
      console.log(`sending the ${content.title} via ${this.name}`);
      return Promise.resolve({
        success: true,
        recipientInformation: content.recipientInformation,
        error: null,
      });
    } catch (err) {
      return Promise.resolve({
        success: false,
        recipientInformation: content.recipientInformation,
        error: err as Error,
      });
    }
  }
}

abstract class Document implements IDocument {
  name: string;

  constructor(private channel: DeliveryChannel) {
    this.name = new.target.name;
  }

  protected abstract generateContent(content: DocumentContent): DocumentContent;

  public deliver(content: DocumentContent): Promise<DeliveryResult> {
    return this.channel.validateAndSend(this.generateContent(content));
  }
}

class Invoice extends Document {
  override generateContent(content: DocumentContent): DocumentContent {
    console.log(`preparing ${this.name}`);
    return content;
  }
}

class MonthlyStatement extends Document {
  override generateContent(content: DocumentContent): DocumentContent {
    console.log(`preparing ${this.name}`);
    return content;
  }
}

class ComplianceNotice extends Document {
  override generateContent(content: DocumentContent): DocumentContent {
    console.log(`preparing ${this.name}`);
    return content;
  }
}

class SalarySlip extends Document {
  override generateContent(content: DocumentContent): DocumentContent {
    console.log(`preparing ${this.name}`);
    return content;
  }
}

const addressSchema: z.ZodType<Address> = z.object({
  line1: z.string().min(1).max(50),
  line2: z.string().max(50),
  city: z.string().min(1).max(60),
  state: z.string().min(1).max(50),
  country: z.string().min(1).max(50),
  postalCode: z.string().min(1).max(20),
});

const recipientSchema: z.ZodType<Recipient> = z.discriminatedUnion(
  "contactType",
  [
    z.object({
      name: z.string().min(1),
      contactType: z.literal("email"),
      contact: z.email(),
    }),

    z.object({
      name: z.string().min(1),
      contactType: z.literal("phone"),
      contact: z.string().min(1).max(12),
    }),

    z.object({
      name: z.string().min(1),
      contactType: z.literal("deviceToken"),
      contact: z.string().min(25).max(100),
    }),

    z.object({
      name: z.string().min(1),
      contactType: z.literal("address"),
      contact: addressSchema,
    }),
  ],
);

function createDocumentContentValidator({
  maxTitleLen,
  maxBodyLen,
}: DocumentContentSchemaParam): z.ZodType<DocumentContent> {
  return z.object({
    title: z.string().min(1).max(maxTitleLen),
    body: z.string().min(1).max(maxBodyLen),
    recipientInformation: recipientSchema,
    preparationRules: z.unknown(),
  });
}

type DocumentContentSchemaParam = {
  maxTitleLen: number;
  maxBodyLen: number;
};
