import { NotificationSendingFail } from "./errors.js";

// our system
interface NotificationSender {
  send(message: string): Promise<void>;
}

// 3rd party
class LegacyEmailSDK {
  protected async dispatchEmail(payload: {
    body: string;
    priority: "NORMAL" | "HIGH";
  }): Promise<{
    accepted: boolean;
    messageId: string;
  }> {
    return {
      accepted: true,
      messageId: "MSG-101",
    };
  }
}

//  adapter using inheritence
class LegacyEmailClassAdapter
  extends LegacyEmailSDK
  implements NotificationSender
{
  async send(message: string): Promise<void> {
    const result = await this.dispatchEmail({
      body: message,
      priority: "NORMAL",
    });

    if (!result.accepted) {
      throw new NotificationSendingFail();
    }
  }
}
