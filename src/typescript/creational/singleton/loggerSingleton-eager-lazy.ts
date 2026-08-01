export interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export type LogLevelMap = Record<0 | 1 | 2, string>;

export abstract class Logger implements ILogger {
  private _prefix: string = "APP";
  protected level: LogLevelMap = {
    0: "info",
    1: "warn",
    2: "error",
  };

  protected constructor() {}

  setPrefix(val: string) {
    this._prefix = val;
  }

  get prefix() {
    return this._prefix;
  }

  abstract info(message: string): void;
  abstract warn(message: string): void;
  abstract error(message: string): void;

  setLevel(level: Partial<LogLevelMap> = {}): void {
    this.level = {
      ...this.level,
      ...level,
    };
  }

  protected log(logLevel: keyof LogLevelMap, message: string): void {
    const level = this.level[logLevel];
    console.log(
      `[${level.padEnd(5)}] [${new Date().toISOString()}] ${"[" + this.prefix + "]"} ${message}`,
    );
  }
}

export class LoggerSingleton extends Logger {
  //   private static _instance: LoggerSingleton = new LoggerSingleton();  // eager
  private static _instance?: LoggerSingleton; // lazy

  private constructor() {
    super();
  }

  static getInstance(): LoggerSingleton {
    if (!LoggerSingleton._instance) {
      LoggerSingleton._instance = new LoggerSingleton();
    }
    return LoggerSingleton._instance;
  }

  override info(message: string): void {
    this.log(0, message);
  }

  override warn(message: string): void {
    this.log(1, message);
  }

  override error(message: string): void {
    this.log(2, message);
  }
}

// test
const logger1 = LoggerSingleton.getInstance();
const logger2 = LoggerSingleton.getInstance();

logger1.setPrefix("ORDER-SERVICE");
logger2.info("Order created");

console.log(logger1 === logger2); // true

// const logger = new LoggerSingleton(); // compilation failed
