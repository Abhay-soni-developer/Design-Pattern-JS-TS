interface Logger {
  log(message: string): void;
}

// third party logger
class ThirdPartyLogger {
  writeLog(
    severity: "INFO" | "ERROR",
    payload: {
      text: string;
      timestamp: number;
    },
  ): void {
    console.log(severity, payload);
  }
}

//Adapter
class ThirdPartyLoggerAdapter implements Logger {
  constructor(private readonly logger: ThirdPartyLogger) {}
  log(message: string): void {
    this.logger.writeLog("INFO", {
      text: message,
      timestamp: Date.now(),
    });
  }
}

const logger: Logger = new ThirdPartyLoggerAdapter(new ThirdPartyLogger());

logger.log("Order created");
