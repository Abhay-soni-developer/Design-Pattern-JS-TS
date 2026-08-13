interface Database {
  query(sql: string): Promise<unknown>;
}

class PostgresDatabase implements Database {
  private static creationCount = 0;
  private static queryCount = 0;

  private constructor() {}

  static connect(): Promise<PostgresDatabase> {
    console.log("connecting to db now ...");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          console.log("connected to db now");
          PostgresDatabase.creationCount++;
          resolve(new PostgresDatabase());
        } catch (err) {
          reject("something went wrong");
        }
      }, 2000);
    });
  }

  async query(sql: string): Promise<unknown> {
    PostgresDatabase.queryCount++;
    console.log(`running command : ${sql}`);
    return {};
  }

  static get metrics() {
    return `
    creation count: ${PostgresDatabase.creationCount}
    queryCount: ${PostgresDatabase.queryCount}
    `;
  }
}

class VirtualDatabaseProxy implements Database {
  private database: Database | null = null;
  private pendingDatabase: Promise<Database> | null = null;

  constructor(private createDatabase: () => Promise<Database>) {}

  async query(sql: string): Promise<unknown> {
    if (this.database === null && this.pendingDatabase instanceof Promise) {
      return this.pendingDatabase.then((db) => {
        return db.query(sql);
      });
    }

    if (this.database === null) {
      this.pendingDatabase = this.createDatabase();
      return this.pendingDatabase
        .then((db) => {
          this.database = db;
          this.pendingDatabase = null;
          return db.query(sql);
        })
        .catch((err) => {
          this.pendingDatabase = null;
          throw err;
        });
    }

    return this.database.query(sql);
  }
}

const proxy = new VirtualDatabaseProxy(() => PostgresDatabase.connect());

// "create Table abhay with name, age, salary, id"
await Promise.all([
  proxy.query("SELECT 1"),
  proxy.query("SELECT 2"),
  proxy.query("SELECT 3"),
]).then((results) => {
  console.log(PostgresDatabase.metrics);
});
