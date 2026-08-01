class DatabaseClientSingleton {
  private static instance: DatabaseClientSingleton | null = null;
  private static pending: Promise<DatabaseClientSingleton> | null = null;
  private static connectionAttempts: number = 0;
  private static shouldFailNextAttempt: boolean = false;

  private constructor() {}

  private static connect(): Promise<DatabaseClientSingleton> {
    DatabaseClientSingleton.connectionAttempts =
      DatabaseClientSingleton.connectionAttempts + 1;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (DatabaseClientSingleton.shouldFailNextAttempt) {
            DatabaseClientSingleton.shouldFailNextAttempt = false;
            throw new Error("Simulated database connection failure");
          }
          DatabaseClientSingleton.instance = new DatabaseClientSingleton();
          resolve(DatabaseClientSingleton.instance);
        } catch (error) {
          reject(error);
        } finally {
          DatabaseClientSingleton.pending = null;
        }
      }, 2000);
    });
  }

  static getInstance(): Promise<DatabaseClientSingleton> {
    if (DatabaseClientSingleton.instance) {
      return Promise.resolve(DatabaseClientSingleton.instance);
    }

    if (DatabaseClientSingleton.pending) {
      return DatabaseClientSingleton.pending;
    }

    DatabaseClientSingleton.pending = DatabaseClientSingleton.connect();
    return DatabaseClientSingleton.pending;
  }

  static getConnectionAttempts() {
    return this.connectionAttempts;
  }

  static failNextConnectionAttempt(): void {
    this.shouldFailNextAttempt = true;
  }
}

// const [db1, db2, db3] = await Promise.all([
//   DatabaseClientSingleton.getInstance(),
//   DatabaseClientSingleton.getInstance(),
//   DatabaseClientSingleton.getInstance(),
// ]);

// console.log(db1 === db2);
// console.log(db2 === db3);
// console.log(DatabaseClientSingleton.getConnectionAttempts());

DatabaseClientSingleton.failNextConnectionAttempt();
try {
  await DatabaseClientSingleton.getInstance();
} catch {
  console.log("First attempt failed as expected");
}

const db1 = await DatabaseClientSingleton.getInstance();
const db2 = await DatabaseClientSingleton.getInstance();

console.log(db1 === db2); // true
console.log(DatabaseClientSingleton.getConnectionAttempts()); // 2
